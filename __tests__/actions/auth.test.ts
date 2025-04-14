import {
    createAccount,
    loginAccount,
    nextAuthLogin,
    verifyEmail,
    verifyOTPToken,
    createClinicAccount,
    regenerateOTPToken,
    isEmailTaken,
} from "../../actions/auth";
import { prismaMock, mockSession, emailServiceMock } from "../utils/mocks";
import * as hashUtils from "../../lib/index";
import jwt from "jsonwebtoken";

// Mock dependencies
jest.mock("next-auth/react", () => ({
    signOut: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../lib/index", () => ({
    prisma: jest.requireMock("../utils/mocks").prismaMock,
    hashPassword: jest.fn().mockResolvedValue("hashed_password_123"),
    verifyPassword: jest.fn().mockResolvedValue(true),
    generateOtp: jest.fn().mockReturnValue("123456"),
    generateVerificationToken: jest.fn().mockReturnValue("test-verification-token"),
    toTitleCase: jest.fn((text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()),
}));

jest.mock("../../actions", () => ({
    createNewPreferenceDefault: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
}));

describe("Authentication Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock process.env
        process.env.EMAIL_VERIFICATION_SECRET = "test-secret";
        process.env.FRONTEND_URL = "http://localhost:3000";
    });

    describe("isEmailTaken", () => {
        it("should return true if email is taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 1,
                email: "test@example.com",
                password_hash: "hashed",
                user_uuid: "user-uuid",
                first_name: "Test",
                last_name: "User",
                role: "USER",
                created_at: new Date(),
                updated_at: new Date(),
            } as any);

            const result = await isEmailTaken("test@example.com");
            expect(result).toBe(true);
            expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
            });
        });

        it("should return false if email is not taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);

            const result = await isEmailTaken("available@example.com");
            expect(result).toBe(false);
        });
    });

    describe("createAccount", () => {
        const mockUserData = {
            first_name: "john",
            last_name: "doe",
            email: "john.doe@example.com",
            password: "Password123!",
            phone_number: "1234567890",
        };

        it("should create a new user account successfully", async () => {
            // Mock email check
            prismaMock.users.findFirst.mockResolvedValueOnce(null);

            // Mock user creation
            prismaMock.users.create.mockResolvedValueOnce({
                user_id: 1,
                user_uuid: "new-user-uuid",
                email: mockUserData.email,
                first_name: mockUserData.first_name,
                last_name: mockUserData.last_name,
                phone_number: mockUserData.phone_number,
                role: "USER",
                email_verified: false,
                email_verification_token: "test-verification-token",
                email_verification_expires_at: expect.any(Date),
                created_at: new Date(),
                updated_at: new Date(),
            } as any);

            const result = await createAccount(mockUserData);

            expect(result).toEqual({
                success: true,
                data: { user_uuid: "new-user-uuid" },
            });

            // Verify interactions
            expect(hashUtils.hashPassword).toHaveBeenCalledWith(mockUserData.password);
            expect(hashUtils.generateVerificationToken).toHaveBeenCalledWith(mockUserData.email);
            expect(prismaMock.users.create).toHaveBeenCalled();
            // Verify createNewPreferenceDefault was called with the new user ID
            expect(jest.requireMock("../../actions").createNewPreferenceDefault).toHaveBeenCalledWith(1);
            // Verify email was sent
            expect(jest.requireMock("../../actions").sendEmail).toHaveBeenCalled();
        });

        it("should handle email already taken", async () => {
            // Mock email check - email exists
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 2,
                email: mockUserData.email,
            } as any);

            const result = await createAccount(mockUserData);

            expect(result).toEqual({
                success: false,
                error: "email_or_phone_number_already_exists",
            });

            // Verify user was not created
            expect(prismaMock.users.create).not.toHaveBeenCalled();
        });

        it("should handle validation errors", async () => {
            const invalidUserData = {
                ...mockUserData,
                email: "not-an-email", // Invalid email format
            };

            const result = await createAccount(invalidUserData);

            expect(result).toEqual({
                success: false,
                error: "Invalid input",
            });

            // Verify user was not created
            expect(prismaMock.users.create).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            // Mock email check
            prismaMock.users.findFirst.mockResolvedValueOnce(null);

            // Mock database error
            prismaMock.users.create.mockRejectedValueOnce(new Error("Database error"));

            const result = await createAccount(mockUserData);

            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("verifyEmail", () => {
        const testToken = "valid-verification-token";

        it("should verify email successfully", async () => {
            // Mock jwt verification
            (jwt.verify as jest.Mock).mockReturnValueOnce({ email: "user@example.com" });

            // Mock user update
            prismaMock.users.updateMany.mockResolvedValueOnce({ count: 1 });

            const result = await verifyEmail(testToken);

            expect(result).toEqual({
                success: true,
                data: { verified: true },
            });

            // Verify jwt.verify was called with correct parameters
            expect(jwt.verify).toHaveBeenCalledWith(testToken, "test-secret");

            // Verify user was updated
            expect(prismaMock.users.updateMany).toHaveBeenCalledWith({
                where: { email: "user@example.com" },
                data: {
                    email_verified: true,
                    email_verification_token: null,
                    email_verification_expires_at: null,
                },
            });
        });

        it("should handle user not found", async () => {
            // Mock jwt verification
            (jwt.verify as jest.Mock).mockReturnValueOnce({ email: "nonexistent@example.com" });

            // Mock user update - user not found
            prismaMock.users.updateMany.mockResolvedValueOnce({ count: 0 });

            const result = await verifyEmail(testToken);

            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
        });

        it("should handle invalid token", async () => {
            // Mock jwt verification failure
            (jwt.verify as jest.Mock).mockImplementationOnce(() => {
                throw new Error("Invalid token");
            });

            const result = await verifyEmail("invalid-token");

            expect(result).toEqual({
                success: false,
                error: "Invalid token",
            });

            // Verify user was not updated
            expect(prismaMock.users.updateMany).not.toHaveBeenCalled();
        });
    });

    describe("verifyOTPToken", () => {
        const testEmail = "user@example.com";
        const validOtp = "123456";

        it("should verify valid OTP token successfully", async () => {
            const now = new Date();
            const future = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes in the future

            // Mock user lookup
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 1,
                otp_token: validOtp,
                otp_expires_at: future,
                role: "USER",
            } as any);

            // Mock update to clear OTP
            prismaMock.users.update.mockResolvedValueOnce({} as any);

            const result = await verifyOTPToken(testEmail, validOtp);

            expect(result).toEqual({
                success: true,
                data: {
                    correct: true,
                    role: "USER",
                },
            });

            // Verify OTP fields were cleared
            expect(prismaMock.users.update).toHaveBeenCalledWith({
                where: { user_id: 1 },
                data: {
                    otp_token: null,
                    otp_expires_at: null,
                },
            });
        });

        it("should reject expired OTP token", async () => {
            const now = new Date();
            const past = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes in the past

            // Mock user lookup with expired token
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 1,
                otp_token: validOtp,
                otp_expires_at: past,
                role: "USER",
            } as any);

            const result = await verifyOTPToken(testEmail, validOtp);

            expect(result).toEqual({
                success: true,
                data: {
                    correct: false,
                },
            });

            // Verify OTP fields were not cleared
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should reject incorrect OTP token", async () => {
            const now = new Date();
            const future = new Date(now.getTime() + 10 * 60 * 1000);

            // Mock user lookup
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 1,
                otp_token: validOtp,
                otp_expires_at: future,
                role: "USER",
            } as any);

            const result = await verifyOTPToken(testEmail, "wrong-otp");

            expect(result).toEqual({
                success: true,
                data: {
                    correct: false,
                },
            });

            // Verify OTP fields were not cleared
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
            // Mock user not found
            prismaMock.users.findFirst.mockResolvedValueOnce(null);

            const result = await verifyOTPToken("nonexistent@example.com", validOtp);

            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
        });

        it("should handle missing OTP", async () => {
            // Mock user with no OTP
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 1,
                otp_token: null,
                otp_expires_at: null,
                role: "USER",
            } as any);

            const result = await verifyOTPToken(testEmail, validOtp);

            expect(result).toEqual({
                success: false,
                error: "OTP token not found or expired",
            });
        });
    });

    describe("loginAccount", () => {
        const loginData = {
            email: "user@example.com",
            password: "Password123!",
        };

        it("should initiate login process successfully", async () => {
            // Mock user lookup
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 1,
                email: loginData.email,
                password_hash: "hashed_password",
                first_name: "John",
                last_name: "Doe",
                disabled: false,
                email_verified: true,
            } as any);

            // Mock update to set OTP
            prismaMock.users.update.mockResolvedValueOnce({} as any);

            // Mock password verification
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

            const result = await loginAccount(loginData);

            expect(result).toEqual({
                success: true,
                data: { data: {} },
            });

            // Verify OTP was generated and stored
            expect(hashUtils.generateOtp).toHaveBeenCalled();
            expect(prismaMock.users.update).toHaveBeenCalledWith({
                where: { email: loginData.email },
                data: {
                    otp_expires_at: expect.any(Date),
                    otp_token: "123456",
                },
            });

            // Verify email was sent
            expect(jest.requireMock("../../actions").sendEmail).toHaveBeenCalled();
        });

        it("should reject invalid password", async () => {
            // Mock user lookup
            prismaMock.users.findFirst.mockResolvedValueOnce({
                email: loginData.email,
                password_hash: "hashed_password",
            } as any);

            // Mock password verification - invalid password
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(false);

            const result = await loginAccount(loginData);

            expect(result).toEqual({
                success: false,
                error: "Invalid password",
            });

            // Verify no OTP was generated
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(jest.requireMock("../../actions").sendEmail).not.toHaveBeenCalled();
        });

        it("should reject unverified email", async () => {
            // Mock user lookup with unverified email
            prismaMock.users.findFirst.mockResolvedValueOnce({
                email: loginData.email,
                password_hash: "hashed_password",
                disabled: false,
                email_verified: false,
            } as any);

            // Mock password verification
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

            const result = await loginAccount(loginData);

            expect(result).toEqual({
                success: false,
                error: "Email not verified",
            });

            // Verify no OTP was generated
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(jest.requireMock("../../actions").sendEmail).not.toHaveBeenCalled();
        });

        it("should reject disabled account", async () => {
            // Mock user lookup with disabled account
            prismaMock.users.findFirst.mockResolvedValueOnce({
                email: loginData.email,
                password_hash: "hashed_password",
                disabled: true,
                email_verified: true,
            } as any);

            // Mock password verification
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

            const result = await loginAccount(loginData);

            expect(result).toEqual({
                success: false,
                error: "User account is disabled",
            });

            // Verify no OTP was generated
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
            // Mock user not found
            prismaMock.users.findFirst.mockResolvedValueOnce(null);

            const result = await loginAccount(loginData);

            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
        });
    });

    describe("nextAuthLogin", () => {
        const loginData = {
            email: "user@example.com",
            password: "Password123!",
        };

        it("should validate user credentials successfully", async () => {
            const mockUser = {
                user_id: 1,
                email: loginData.email,
                password_hash: "hashed_password",
                first_name: "John",
                last_name: "Doe",
                role: "USER",
                disabled: false,
                email_verified: true,
            } as any;

            // Mock user lookup
            prismaMock.users.findFirst.mockResolvedValueOnce(mockUser);

            // Mock password verification
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

            const result = await nextAuthLogin(loginData.email, loginData.password);

            expect(result).toEqual({
                success: true,
                data: { user: mockUser },
            });
        });

        it("should reject invalid password", async () => {
            // Mock user lookup
            prismaMock.users.findFirst.mockResolvedValueOnce({
                email: loginData.email,
                password_hash: "hashed_password",
            } as any);

            // Mock password verification - invalid password
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(false);

            const result = await nextAuthLogin(loginData.email, loginData.password);

            expect(result).toEqual({
                success: false,
                error: "Invalid password",
            });
        });

        it("should reject unverified email", async () => {
            // Mock user lookup with unverified email
            prismaMock.users.findFirst.mockResolvedValueOnce({
                email: loginData.email,
                password_hash: "hashed_password",
                disabled: false,
                email_verified: false,
            } as any);

            // Mock password verification
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

            const result = await nextAuthLogin(loginData.email, loginData.password);

            expect(result).toEqual({
                success: false,
                error: "Email not verified",
            });
        });

        it("should reject disabled account", async () => {
            // Mock user lookup with disabled account
            prismaMock.users.findFirst.mockResolvedValueOnce({
                email: loginData.email,
                password_hash: "hashed_password",
                disabled: true,
                email_verified: true,
            } as any);

            // Mock password verification
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

            const result = await nextAuthLogin(loginData.email, loginData.password);

            expect(result).toEqual({
                success: false,
                error: "User account is disabled",
            });
        });
    });

    describe("createClinicAccount", () => {
        const mockClinicData = {
            first_name: "john",
            last_name: "doe",
            email: "clinic@example.com",
            password: "Password123!",
            phone_number: "1234567890",
            name: "pet clinic",
            address: "123 Main St",
            city: "Anytown",
            state: "ST",
            postal_code: "12345",
            emergency_services: true,
        };

        it("should create a new clinic account successfully", async () => {
            // Mock email check
            prismaMock.users.findFirst.mockResolvedValueOnce(null);

            // Mock user creation
            prismaMock.users.create.mockResolvedValueOnce({
                user_id: 1,
                user_uuid: "new-clinic-uuid",
                email: mockClinicData.email,
                first_name: mockClinicData.first_name,
                last_name: mockClinicData.last_name,
                phone_number: mockClinicData.phone_number,
                role: "CLIENT",
                email_verified: false,
                created_at: new Date(),
                updated_at: new Date(),
            } as any);

            // Mock clinic creation
            prismaMock.clinics.create.mockResolvedValueOnce({
                clinic_id: 1,
                name: mockClinicData.name,
                address: mockClinicData.address,
                city: mockClinicData.city,
                state: mockClinicData.state,
                postal_code: mockClinicData.postal_code,
                phone_number: mockClinicData.phone_number,
                emergency_services: mockClinicData.emergency_services,
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            } as any);

            const result = await createClinicAccount(mockClinicData);

            expect(result).toEqual({
                success: true,
                data: { user_uuid: "new-clinic-uuid" },
            });

            // Verify toTitleCase was called for name formatting
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.first_name);
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.last_name);
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.name);

            // Verify clinic was created with correct data
            expect(prismaMock.clinics.create).toHaveBeenCalled();

            // Verify email was sent
            expect(jest.requireMock("../../actions").sendEmail).toHaveBeenCalled();

            // Verify preferences were created
            expect(jest.requireMock("../../actions").createNewPreferenceDefault).toHaveBeenCalledWith(1);
        });

        it("should handle email already taken", async () => {
            // Mock email check - email exists
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 2,
                email: mockClinicData.email,
            } as any);

            const result = await createClinicAccount(mockClinicData);

            expect(result).toEqual({
                success: false,
                error: "email_or_phone_number_already_exists",
            });

            // Verify user and clinic were not created
            expect(prismaMock.users.create).not.toHaveBeenCalled();
            expect(prismaMock.clinics.create).not.toHaveBeenCalled();
        });

        it("should handle validation errors", async () => {
            const invalidClinicData = {
                ...mockClinicData,
                email: "not-an-email", // Invalid email format
            };

            const result = await createClinicAccount(invalidClinicData as any);

            expect(result).toEqual({
                success: false,
                error: "Invalid input",
            });

            // Verify user and clinic were not created
            expect(prismaMock.users.create).not.toHaveBeenCalled();
            expect(prismaMock.clinics.create).not.toHaveBeenCalled();
        });
    });

    describe("regenerateOTPToken", () => {
        const testEmail = "user@example.com";

        it("should regenerate OTP successfully", async () => {
            // Mock user lookup
            prismaMock.users.findFirst.mockResolvedValueOnce({
                user_id: 1,
                email: testEmail,
                first_name: "John",
                last_name: "Doe",
            } as any);

            // Mock update to set new OTP
            prismaMock.users.update.mockResolvedValueOnce({} as any);

            const result = await regenerateOTPToken(testEmail);

            expect(result).toEqual({
                success: true,
                data: {
                    user: {
                        user_id: 1,
                        email: testEmail,
                        first_name: "John",
                        last_name: "Doe",
                    },
                },
            });

            // Verify OTP was generated and stored
            expect(hashUtils.generateOtp).toHaveBeenCalledWith(testEmail);
            expect(prismaMock.users.update).toHaveBeenCalledWith({
                where: { email: testEmail },
                data: {
                    otp_expires_at: expect.any(Date),
                    otp_token: "123456",
                },
            });

            // Verify email was sent
            expect(jest.requireMock("../../actions").sendEmail).toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
            // Mock user not found
            prismaMock.users.findFirst.mockResolvedValueOnce(null);

            const result = await regenerateOTPToken("nonexistent@example.com");

            expect(result).toEqual({
                success: false,
                error: "User not found",
            });

            // Verify no actions were taken
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(jest.requireMock("../../actions").sendEmail).not.toHaveBeenCalled();
        });
    });
});
