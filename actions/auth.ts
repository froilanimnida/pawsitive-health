"use server";
import { createNewPreferenceDefault, sendEmail } from "@/actions";
import {
    type LoginType,
    SignUpSchema,
    NewClinicAccountSchema,
    type SignUpType,
    type NewClinicAccountType,
    PasswordChangeSchema,
    type PasswordChangeType,
    ForgotPasswordSchema,
    type ForgotPasswordType,
    ResetPasswordSchema,
    type ResetPasswordType,
} from "@/schemas";
import { OtpVerificationEmail, ClinicOnboardingEmail, UserOnboardingEmail, PasswordResetEmail } from "@/templates";
import { hashPassword, verifyPassword, prisma, generateOtp, generateVerificationToken, toTitleCase } from "@/lib";
import { role_type, type users } from "@prisma/client";
import { signOut } from "next-auth/react";
import type { ActionResponse } from "@/types";
import jwt from "jsonwebtoken";

const isEmailTaken = async (email: string): Promise<boolean> => {
    const user = await prisma.users.findFirst({
        where: { email: email },
    });
    return user !== null;
};

const createAccount = async (values: SignUpType): Promise<ActionResponse | void> => {
    try {
        const formData = SignUpSchema.safeParse(values);
        if (!formData.success) return { success: false, error: "Invalid input" };
        const userEmailTaken = await isEmailTaken(formData.data.email);
        if (userEmailTaken) return { success: false, error: "email_or_phone_number_already_exists" };
        const userEmail = formData.data.email;
        const verification_token = generateVerificationToken(userEmail);
        const verification_url = `${process.env.FRONTEND_URL}/verify-email/${verification_token}`;
        const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const result = await prisma.users.create({
            data: {
                email: formData.data.email,
                password_hash: await hashPassword(formData.data.password),
                first_name: formData.data.first_name,
                last_name: formData.data.last_name,
                phone_number: formData.data.phone_number,
                role: role_type.user,
                email_verified: false,
                email_verification_token: verification_token,
                email_verification_expires_at: expires_at,
            },
        });
        if (result.user_id === null) return { success: false, error: "Failed to create account" };
        await sendEmail(
            UserOnboardingEmail,
            {
                firstName: toTitleCase(formData.data.first_name),
                lastName: toTitleCase(formData.data.last_name),
                verificationUrl: verification_url,
                expiresIn: expires_at.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
            {
                to: userEmail,
                subject: "Welcome to Pawsitive - Verify your email",
            },
        );
        await createNewPreferenceDefault(result.user_id);
        return;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const verifyEmail = async (token: string): Promise<ActionResponse | void> => {
    try {
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET as string) as {
            email: string;
        };

        const result = await prisma.users.updateMany({
            where: { email: decoded.email },
            data: { email_verified: true, email_verification_token: null, email_verification_expires_at: null },
        });

        if (result.count === 0) return { success: false, error: "User not found" };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Invalid or expired token" };
    }
};

const logout = async () => await signOut({ callbackUrl: "/signin" });

const verifyOTPToken = async (
    email: string,
    otpToken: string,
): Promise<ActionResponse<{ correct: boolean; role?: role_type }>> => {
    try {
        const user = await prisma.users.findFirst({
            where: { email },
            select: {
                user_id: true,
                otp_token: true,
                otp_expires_at: true,
                role: true,
            },
        });

        if (!user) return { success: false, error: "User not found" };
        if (user.otp_token === null || user.otp_expires_at === null)
            return { success: false, error: "OTP token not found or expired" };

        const isCorrect = user.otp_token === otpToken && user.otp_expires_at > new Date();

        if (isCorrect) {
            await prisma.users.update({
                where: { user_id: user.user_id },
                data: {
                    otp_token: null,
                    otp_expires_at: null,
                },
            });
        }

        return {
            success: true,
            data: {
                correct: isCorrect,
                role: isCorrect ? user.role : undefined,
            },
        };
    } catch (error) {
        console.error("OTP verification error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Invalid or expired OTP token" };
    }
};

const createClinicAccount = async (values: NewClinicAccountType): Promise<ActionResponse<{ user_uuid: string }>> => {
    try {
        const formData = await NewClinicAccountSchema.safeParseAsync(values);
        if (!formData.success) return { success: false, error: "Invalid input" };

        const user = await prisma.users.findFirst({
            where: { OR: [{ email: values.email }, { phone_number: values.phone_number }] },
        });

        if (user !== null) return { success: false, error: "email_or_phone_number_already_exists" };

        const verification_token = generateVerificationToken(formData.data.email);
        const verification_url = `${process.env.FRONTEND_URL}/auth/verify-email/${verification_token}`;
        const firstName = toTitleCase(formData.data.first_name);
        const lastName = toTitleCase(formData.data.last_name);

        const result = await prisma.users.create({
            data: {
                email: formData.data.email,
                password_hash: await hashPassword(values.password),
                first_name: firstName,
                last_name: lastName,
                phone_number: formData.data.phone_number,
                role: role_type.client,
                email_verified: false,
                email_verification_token: verification_token,
                email_verification_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        if (result.user_id === null) return { success: false, error: "Failed to create account" };
        const clinicName = toTitleCase(formData.data.name);
        const clinicResult = await prisma.clinics.create({
            data: {
                name: clinicName,
                address: formData.data.address,
                city: formData.data.city,
                state: formData.data.state,
                postal_code: formData.data.postal_code,
                phone_number: formData.data.phone_number,
                emergency_services: formData.data.emergency_services,
                website: formData.data.website,
                google_maps_url: formData.data.google_maps_url,
                user_id: result.user_id,
            },
        });

        if (clinicResult.clinic_id === null) return { success: false, error: "Failed to create clinic account" };

        await sendEmail(
            ClinicOnboardingEmail,
            {
                firstName: firstName,
                lastName: lastName,
                clinicName: clinicName,
                verificationUrl: verification_url,
                expiresIn: "7 days",
            },
            {
                to: formData.data.email,
                subject: "Welcome to PawsitiveHealth - Verify Your Clinic",
            },
        );
        await createNewPreferenceDefault(result.user_id);
        return { success: true, data: { user_uuid: result.user_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const regenerateOTPToken = async (email: string): Promise<ActionResponse<{ user: users }>> => {
    try {
        const user = await prisma.users.findFirst({
            where: { email: email },
        });

        if (!user) return { success: false, error: "User not found" };

        const otpToken = await generateOtp(user.email);
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.users.update({
            where: { email: user.email },
            data: {
                otp_expires_at: expiryTime,
                otp_token: otpToken,
            },
        });

        await sendEmail(
            OtpVerificationEmail,
            {
                firstName: user.first_name,
                lastName: user.last_name,
                otpCode: otpToken,
                expiresIn: "5 minutes",
            },
            {
                to: user.email,
                subject: "PawsitiveHealth - Your Login Verification Code",
            },
        );

        return { success: true, data: { user } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};
const loginAccount = async (values: LoginType): Promise<ActionResponse<{ data: object }>> => {
    try {
        const user = await prisma.users.findFirst({
            where: { email: values.email },
        });

        if (!user) return { success: false, error: "User not found" };
        if (!(await verifyPassword(values.password, user.password_hash)))
            return { success: false, error: "Invalid password" };

        if (user.disabled) return { success: false, error: "User account is disabled" };
        if (user.email_verified === false) return { success: false, error: "Email not verified" };

        const otp_token = await generateOtp(user.email);
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.users.update({
            where: { email: user.email },
            data: {
                otp_expires_at: expiryTime,
                otp_token: otp_token,
            },
        });

        await sendEmail(
            OtpVerificationEmail,
            {
                firstName: user.first_name,
                lastName: user.last_name,
                otpCode: otp_token,
                expiresIn: "5 minutes",
            },
            {
                to: user.email,
                subject: "PawsitiveHealth - Your Login Verification Code",
            },
        );

        return { success: true, data: { data: {} } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const nextAuthLogin = async (email: string, password: string): Promise<ActionResponse<{ user: users }>> => {
    try {
        const user = await prisma.users.findFirst({
            where: { email: email },
        });
        if (!user) return { success: false, error: "User not found" };
        if (!(await verifyPassword(password, user.password_hash))) return { success: false, error: "Invalid password" };
        if (user.disabled) return { success: false, error: "User account is disabled" };
        if (user.email_verified === false) return { success: false, error: "Email not verified" };

        return { success: true, data: { user } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const changePassword = async (values: PasswordChangeType, userId: number): Promise<ActionResponse | void> => {
    try {
        const formData = PasswordChangeSchema.safeParse(values);
        if (!formData.success) return { success: false, error: "Invalid input" };

        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            select: {
                email: true,
                password_hash: true,
                first_name: true,
                last_name: true,
            },
        });

        if (!user) return { success: false, error: "User not found" };

        // Verify current password
        const isPasswordValid = await verifyPassword(values.current_password, user.password_hash);
        if (!isPasswordValid) return { success: false, error: "Current password is incorrect" };

        // Generate OTP for verification
        const otpToken = await generateOtp(user.email);
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await prisma.users.update({
            where: { user_id: userId },
            data: {
                otp_expires_at: expiryTime,
                otp_token: otpToken,
            },
        });

        await sendEmail(
            OtpVerificationEmail,
            {
                firstName: user.first_name,
                lastName: user.last_name,
                otpCode: otpToken,
                expiresIn: "5 minutes",
            },
            {
                to: user.email,
                subject: "PawsitiveHealth - Password Change Verification Code",
            },
        );
        return;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const confirmPasswordChange = async (
    otp: string,
    newPassword: string,
    userId: number,
): Promise<ActionResponse | void> => {
    try {
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            select: {
                otp_token: true,
                otp_expires_at: true,
                email: true,
            },
        });

        if (!user) return { success: false, error: "User not found" };
        if (user.otp_token === null || user.otp_expires_at === null)
            return { success: false, error: "OTP token not found or expired" };

        const isCorrect = user.otp_token === otp && user.otp_expires_at > new Date();

        if (!isCorrect) return { success: false, error: "Invalid or expired OTP" };

        // Hash new password and update
        const hashedPassword = await hashPassword(newPassword);

        await prisma.users.update({
            where: { user_id: userId },
            data: {
                password_hash: hashedPassword,
                otp_token: null,
                otp_expires_at: null,
            },
        });

        return;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const forgotPassword = async (values: ForgotPasswordType): Promise<ActionResponse<{ message: string }>> => {
    try {
        const formData = ForgotPasswordSchema.safeParse(values);
        if (!formData.success) return { success: false, error: "Invalid input" };

        const user = await prisma.users.findFirst({
            where: { email: formData.data.email },
            select: {
                user_id: true,
                email: true,
                first_name: true,
                last_name: true,
                email_verified: true,
            },
        });

        if (!user) {
            // Don't reveal if a user exists for security
            return {
                success: true,
                data: { message: "If an account with this email exists, a reset link has been sent." },
            };
        }

        if (user.email_verified === false) {
            return { success: false, error: "Email not verified. Please verify your email first." };
        }

        // Generate a password reset token
        const resetToken = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.PASSWORD_RESET_SECRET as string,
            { expiresIn: "1h" },
        );

        // Store the token and expiration in the database
        const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await prisma.users.update({
            where: { user_id: user.user_id },
            data: {
                password_reset_token: resetToken,
                password_reset_expires_at: expiryTime,
            },
        });

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/forgot-password/new-password?token=${resetToken}`;

        // Send email with reset link
        await sendEmail(
            PasswordResetEmail,
            {
                firstName: user.first_name,
                lastName: user.last_name,
                resetUrl: resetUrl,
                expiresIn: "1 hour",
            },
            {
                to: user.email,
                subject: "PawsitiveHealth - Password Reset Request",
            },
        );

        return {
            success: true,
            data: { message: "If an account with this email exists, a reset link has been sent." },
        };
    } catch (error) {
        console.error("Password reset request error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const resetPassword = async (values: ResetPasswordType): Promise<ActionResponse<{ message: string }>> => {
    try {
        const formData = ResetPasswordSchema.safeParse(values);
        if (!formData.success) return { success: false, error: "Invalid input" };

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(formData.data.token, process.env.PASSWORD_RESET_SECRET as string) as {
                userId: number;
                email: string;
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Invalid or expired token",
            };
        }

        // Find the user by ID and check if token is valid
        const user = await prisma.users.findFirst({
            where: {
                user_id: decoded.userId,
                email: decoded.email,
                password_reset_token: formData.data.token,
                password_reset_expires_at: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return { success: false, error: "Invalid or expired reset link" };
        }

        // Hash the new password
        const hashedPassword = await hashPassword(formData.data.password);

        // Update the user's password and clear the reset token
        await prisma.users.update({
            where: { user_id: user.user_id },
            data: {
                password_hash: hashedPassword,
                password_reset_token: null,
                password_reset_expires_at: null,
            },
        });

        return { success: true, data: { message: "Password has been reset successfully" } };
    } catch (error) {
        console.error("Password reset error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export {
    loginAccount,
    createAccount,
    createClinicAccount,
    logout,
    verifyEmail,
    verifyOTPToken,
    nextAuthLogin,
    regenerateOTPToken,
    isEmailTaken,
    changePassword,
    confirmPasswordChange,
    forgotPassword,
    resetPassword,
};
