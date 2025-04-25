// Import dependencies first
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient, role_type } from "@prisma/client";
import { testUsers, testFormData, createTestData } from "../utils/testData";

// Create a direct mock for prisma
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Mock external dependencies first
jest.mock("next-auth/react", () => ({
    signOut: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
    sign: jest.fn().mockReturnValue("mock-token"),
}));

// Mock the lib module first, using our local prismaMock
jest.mock("@/lib", () => {
    return {
        __esModule: true,
        prisma: prismaMock,
        hashPassword: jest.fn().mockResolvedValue("hashed_password_123"),
        verifyPassword: jest.fn().mockResolvedValue(true),
        generateOtp: jest.fn().mockReturnValue("123456"),
        generateVerificationToken: jest.fn().mockReturnValue("test-verification-token"),
        toTitleCase: jest.fn((text) => (text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "")),
    };
});

// Mock the actions module
jest.mock("@/actions", () => ({
    __esModule: true,
    createNewPreferenceDefault: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(true),
}));

// Mock NextAuth route
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
    authOptions: {
        providers: [],
        callbacks: {},
    },
}));

// Import auth actions after all mocks are set up
import {
    isEmailTaken,
    createAccount,
    verifyEmail,
    verifyOTPToken,
    loginAccount,
    nextAuthLogin,
    createClinicAccount,
    regenerateOTPToken,
} from "@/actions/auth";

// Use the test data from the centralized constants file
const VALID_DATA = testUsers.validUser;

describe("Authentication Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.EMAIL_VERIFICATION_SECRET = "test-secret";
        process.env.FRONTEND_URL = "http://localhost:3000";
        (jwt.verify as jest.Mock).mockClear();
    });

    describe("isEmailTaken", () => {
        it("should return true if email is taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(VALID_DATA);
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
        // Use test form data from constants
        const mockUserData = testFormData.validSignUp;

        it("should create a new user account successfully", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            prismaMock.users.create.mockResolvedValueOnce(
                createTestData(VALID_DATA, {
                    user_uuid: "new-user-uuid",
                }),
            );

            const mockedActions = jest.requireMock("@/actions");

            const result = await createAccount(mockUserData);

            expect(result).toEqual({
                success: true,
                data: { user_uuid: "new-user-uuid" },
            });

            expect(hashUtils.hashPassword).toHaveBeenCalledWith(mockUserData.password);
            expect(hashUtils.generateVerificationToken).toHaveBeenCalledWith(mockUserData.email);
            expect(prismaMock.users.create).toHaveBeenCalled();
            expect(mockedActions.createNewPreferenceDefault).toHaveBeenCalledWith(1);
            expect(mockedActions.sendEmail).toHaveBeenCalled();
        });

        it("should handle email already taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 2,
                email: mockUserData.email,
                user_uuid: "existing-user-uuid",
                first_name: "Existing",
                last_name: "User",
                phone_number: "0987654321",
            });

            const result = await createAccount(mockUserData);

            expect(result).toEqual({
                success: false,
                error: "email_or_phone_number_already_exists",
            });
            expect(prismaMock.users.create).not.toHaveBeenCalled();
        });

        it("should handle validation errors", async () => {
            const invalidUserData = {
                ...mockUserData,
                email: "not-an-email",
            };
            const result = await createAccount(invalidUserData);
            expect(result).toEqual({
                success: false,
                error: "Invalid input",
            });
            expect(prismaMock.users.create).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
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
            (jwt.verify as jest.Mock).mockReturnValueOnce({ email: "user@example.com" });
            prismaMock.users.updateMany.mockResolvedValueOnce({ count: 1 });
            const result = await verifyEmail(testToken);
            expect(result).toEqual({
                success: true,
                data: { verified: true },
            });
            expect(jwt.verify).toHaveBeenCalledWith(testToken, "test-secret");
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
            (jwt.verify as jest.Mock).mockReturnValueOnce({ email: "nonexistent@example.com" });
            prismaMock.users.updateMany.mockResolvedValueOnce({ count: 0 });
            const result = await verifyEmail(testToken);
            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
        });

        it("should handle invalid token", async () => {
            (jwt.verify as jest.Mock).mockImplementationOnce(() => {
                throw new Error("Invalid token");
            });
            const result = await verifyEmail("invalid-token");
            expect(result).toEqual({
                success: false,
                error: "Invalid token",
            });
            expect(prismaMock.users.updateMany).not.toHaveBeenCalled();
        });
    });

    describe("verifyOTPToken", () => {
        const testEmail = "user@example.com";
        const validOtp = "123456";

        it("should verify valid OTP token successfully", async () => {
            const now = new Date();
            const future = new Date(now.getTime() + 10 * 60 * 1000);
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                otp_token: validOtp,
                otp_expires_at: future,
            });
            prismaMock.users.update.mockResolvedValueOnce({ ...VALID_DATA, otp_token: null, otp_expires_at: null });
            const result = await verifyOTPToken(testEmail, validOtp);
            expect(result).toEqual({
                success: true,
                data: {
                    correct: true,
                    role: "user",
                },
            });
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
            const past = new Date(now.getTime() - 10 * 60 * 1000);
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                otp_token: validOtp,
                otp_expires_at: past,
            });
            const result = await verifyOTPToken(testEmail, validOtp);
            expect(result).toEqual({
                success: true,
                data: {
                    correct: false,
                },
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should reject incorrect OTP token", async () => {
            const now = new Date();
            const future = new Date(now.getTime() + 10 * 60 * 1000);
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                otp_token: validOtp,
                otp_expires_at: future,
            });
            const result = await verifyOTPToken(testEmail, "wrong-otp");
            expect(result).toEqual({
                success: true,
                data: {
                    correct: false,
                },
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            const result = await verifyOTPToken("nonexistent@example.com", validOtp);
            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
        });

        it("should handle missing OTP", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                otp_token: null,
                otp_expires_at: null,
            });
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
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                email_verified: true,
            });
            prismaMock.users.update.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 1,
                email: loginData.email,
                first_name: "John",
                last_name: "Doe",
                otp_token: "123456",
                otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

            const mockedActions = jest.requireMock("@/actions");
            const result = await loginAccount(loginData);

            expect(result).toEqual({
                success: true,
                data: { data: {} },
            });
            expect(hashUtils.generateOtp).toHaveBeenCalled();
            expect(prismaMock.users.update).toHaveBeenCalledWith({
                where: { email: loginData.email },
                data: {
                    otp_expires_at: expect.any(Date),
                    otp_token: "123456",
                },
            });
            expect(mockedActions.sendEmail).toHaveBeenCalled();
        });

        it("should reject invalid password", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(false);
            const mockedActions = jest.requireMock("@/actions");
            const result = await loginAccount(loginData);
            expect(result).toEqual({
                success: false,
                error: "Invalid password",
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(mockedActions.sendEmail).not.toHaveBeenCalled();
        });

        it("should reject unverified email", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                email_verified: false,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            const mockedActions = jest.requireMock("@/actions");
            const result = await loginAccount(loginData);
            expect(result).toEqual({
                success: false,
                error: "Email not verified",
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(mockedActions.sendEmail).not.toHaveBeenCalled();
        });

        it("should reject disabled account", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                disabled: true,
                email_verified: true,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            const result = await loginAccount(loginData);
            expect(result).toEqual({
                success: false,
                error: "User account is disabled",
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
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
                ...VALID_DATA,
                email: loginData.email,
                email_verified: true,
            };
            prismaMock.users.findFirst.mockResolvedValueOnce(mockUser);
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            const result = await nextAuthLogin(loginData.email, loginData.password);
            expect(result).toEqual({
                success: true,
                data: { user: mockUser },
            });
        });

        it("should reject invalid password", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(false);
            const result = await nextAuthLogin(loginData.email, loginData.password);
            expect(result).toEqual({
                success: false,
                error: "Invalid password",
            });
        });

        it("should reject unverified email", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                email_verified: false,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            const result = await nextAuthLogin(loginData.email, loginData.password);
            expect(result).toEqual({
                success: false,
                error: "Email not verified",
            });
        });

        it("should reject disabled account", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                disabled: true,
                email_verified: true,
            });
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
            confirm_password: "Password123!",
            phone_number: "1234567890",
            name: "pet clinic",
            address: "123 Main St",
            city: "Anytown",
            state: "ST",
            postal_code: "12345",
            emergency_services: true,
            operating_hours: [
                { day_of_week: 0, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 1, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 2, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 3, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 4, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 5, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 6, opens_at: "08:00", closes_at: "17:00", is_closed: false },
            ],
        };

        it("should create a new clinic account successfully", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            prismaMock.users.create.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 1,
                user_uuid: "new-clinic-uuid",
                email: mockClinicData.email,
                first_name: mockClinicData.first_name,
                last_name: mockClinicData.last_name,
                phone_number: mockClinicData.phone_number,
                role: role_type.client,
            });
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
                clinic_uuid: "new-clinic-uuid",
                google_maps_url: "https://maps.google.com",
                latitude: 12.345678,
                longitude: 98.765432,
                website: "",
            });

            const mockedActions = jest.requireMock("@/actions");
            const result = await createClinicAccount(mockClinicData);

            expect(result).toEqual({
                success: true,
                data: { user_uuid: "new-clinic-uuid" },
            });
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.first_name);
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.last_name);
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.name);
            expect(prismaMock.clinics.create).toHaveBeenCalled();
            expect(mockedActions.sendEmail).toHaveBeenCalled();
            expect(mockedActions.createNewPreferenceDefault).toHaveBeenCalledWith(1);
        });

        it("should handle email already taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 2,
                email: mockClinicData.email,
            });
            const result = await createClinicAccount(mockClinicData);
            expect(result).toEqual({
                success: false,
                error: "email_or_phone_number_already_exists",
            });
            expect(prismaMock.users.create).not.toHaveBeenCalled();
            expect(prismaMock.clinics.create).not.toHaveBeenCalled();
        });

        it("should handle validation errors", async () => {
            const invalidClinicData = {
                ...mockClinicData,
                email: "not-an-email",
            };
            const result = await createClinicAccount(invalidClinicData);
            expect(result).toEqual({
                success: false,
                error: "Invalid input",
            });
            expect(prismaMock.users.create).not.toHaveBeenCalled();
            expect(prismaMock.clinics.create).not.toHaveBeenCalled();
        });
    });

    describe("regenerateOTPToken", () => {
        const testEmail = "user@example.com";

        it("should regenerate OTP successfully", async () => {
            const mockUser = {
                ...VALID_DATA,
                user_id: 1,
                email: testEmail,
                first_name: "John",
                last_name: "Doe",
            };
            prismaMock.users.findFirst.mockResolvedValueOnce(mockUser);
            prismaMock.users.update.mockResolvedValueOnce({
                ...mockUser,
                otp_token: "123456",
                otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
            });

            const mockedActions = jest.requireMock("@/actions");
            const result = await regenerateOTPToken(testEmail);

            expect(result).toEqual({
                success: true,
                data: { user: mockUser },
            });
            expect(hashUtils.generateOtp).toHaveBeenCalledWith(testEmail);
            expect(prismaMock.users.update).toHaveBeenCalledWith({
                where: { email: testEmail },
                data: {
                    otp_expires_at: expect.any(Date),
                    otp_token: "123456",
                },
            });
            expect(mockedActions.sendEmail).toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            const mockedActions = jest.requireMock("@/actions");
            const result = await regenerateOTPToken("nonexistent@example.com");
            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(mockedActions.sendEmail).not.toHaveBeenCalled();
        });
    });
});
