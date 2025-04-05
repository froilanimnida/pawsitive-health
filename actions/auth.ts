"use server";
import { prisma } from "@/lib/prisma";
import { LoginType, SignUpSchema, NewClinicAccountSchema } from "@/schemas";
import type { z } from "zod";
import { role_type, type users } from "@prisma/client";
import { signOut } from "next-auth/react";
import { hashPassword, verifyPassword } from "@/lib/functions/security/password-check";
import type { ActionResponse } from "@/types/server-action-response";
import jwt from "jsonwebtoken";
import { generateVerificationToken } from "@/lib/functions/security/generate-verification-token";
import { generateOtp } from "@/lib/functions/security/otp-generator";
import emailService from "@/lib/email-service";
import { OtpVerificationEmail, ClinicOnboardingEmail, UserOnboardingEmail } from "@/templates";

const createAccount = async (values: z.infer<typeof SignUpSchema>): Promise<ActionResponse<{ user_uuid: string }>> => {
    try {
        const formData = SignUpSchema.safeParse(values);
        if (!formData.success) {
            return { success: false, error: "Invalid input" };
        }
        const user = await prisma.users.findFirst({
            where: {
                OR: [{ email: values.email }, { phone_number: values.phone_number }],
            },
        });
        if (user) return { success: false, error: "email_or_phone_number_already_exists" };
        const verification_token = generateVerificationToken(formData.data.email);
        const verification_url = `${process.env.FRONTEND_URL}/auth/verify-email/${verification_token}`;
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
        await emailService.sendMail(
            UserOnboardingEmail,
            {
                firstName: formData.data.first_name,
                lastName: formData.data.last_name,
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
                to: formData.data.email,
                subject: "Welcome to Pawsitive - Verify your email",
            },
        );
        return { success: true, data: { user_uuid: result.user_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const verifyEmail = async (token: string): Promise<ActionResponse<{ verified: boolean }>> => {
    try {
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET || "fallback-secret-key") as {
            email: string;
        };

        const result = await prisma.users.updateMany({
            where: { email: decoded.email },
            data: { email_verified: true, email_verification_token: null, email_verification_expires_at: null },
        });

        if (result.count === 0) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: { verified: true } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Invalid or expired token",
        };
    }
};

const logout = async () => await signOut({ callbackUrl: "/auth/login" });

const verifyOTPToken = async (email: string, otpToken: string): Promise<ActionResponse<{ correct: boolean }>> => {
    try {
        const user = await prisma.users.findFirst({
            where: {
                email: email,
            },
            select: {
                user_id: true,
                otp_token: true,
                otp_expires_at: true,
            },
        });

        if (!user) return { success: false, error: "User not found" };
        if (user.otp_token === null || user.otp_expires_at === null)
            return { success: false, error: "OTP token not found or expired" };
        return {
            success: true,
            data: { correct: user.otp_token === otpToken && user.otp_expires_at > new Date() },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Invalid or expired OTP token",
        };
    }
};

const createClinicAccount = async (
    values: z.infer<typeof NewClinicAccountSchema>,
): Promise<ActionResponse<{ user_uuid: string }>> => {
    try {
        const formData = NewClinicAccountSchema.safeParse(values);
        if (!formData.success) return { success: false, error: "Invalid input" };

        const user = await prisma.users.findFirst({
            where: {
                OR: [{ email: values.email }, { phone_number: values.phone_number }],
            },
        });

        if (user !== null) return { success: false, error: "email_or_phone_number_already_exists" };

        const verification_token = generateVerificationToken(formData.data.email);
        const verification_url = `${process.env.FRONTEND_URL}/auth/verify-email/${verification_token}`;

        const result = await prisma.users.create({
            data: {
                email: formData.data.email,
                password_hash: await hashPassword(values.password),
                first_name: formData.data.first_name,
                last_name: formData.data.last_name,
                phone_number: formData.data.phone_number,
                role: role_type.client,
                email_verified: false,
                email_verification_token: verification_token,
                email_verification_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        if (result.user_id === null) return { success: false, error: "Failed to create account" };

        const clinicResult = await prisma.clinics.create({
            data: {
                name: formData.data.name,
                address: formData.data.address,
                city: formData.data.city,
                state: formData.data.state,
                postal_code: formData.data.postal_code,
                phone_number: formData.data.phone_number,
                emergency_services: formData.data.emergency_services,
                user_id: result.user_id,
            },
        });

        if (clinicResult.clinic_id === null) return { success: false, error: "Failed to create clinic account" };

        await emailService.sendMail(
            ClinicOnboardingEmail,
            {
                firstName: formData.data.first_name,
                lastName: formData.data.last_name,
                clinicName: formData.data.name,
                verificationUrl: verification_url,
                expiresIn: "7 days",
            },
            {
                to: formData.data.email,
                subject: "Welcome to PawsitiveHealth - Verify Your Clinic",
            },
        );

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
            where: {
                email: email,
            },
        });

        if (!user) return { success: false, error: "User not found" };

        // Generate new OTP token
        const otpToken = generateOtp(user.email);
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

        // Update the user with new OTP
        await prisma.users.update({
            where: { email: user.email },
            data: {
                otp_expires_at: expiryTime,
                otp_token: otpToken,
            },
        });

        // Send OTP email
        await emailService.sendMail(
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
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};
const loginAccount = async (values: LoginType): Promise<ActionResponse<{}>> => {
    try {
        const user = await prisma.users.findFirst({
            where: {
                email: values.email,
            },
        });

        if (!user) return { success: false, error: "User not found" };
        if (!(await verifyPassword(values.password, user.password_hash)))
            return { success: false, error: "Invalid password" };

        if (user.disabled) return { success: false, error: "User account is disabled" };
        if (user.email_verified === false) return { success: false, error: "Email not verified" };

        const otp_token = generateOtp(user.email);
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.users.update({
            where: { email: user.email },
            data: {
                otp_expires_at: expiryTime,
                otp_token: otp_token,
            },
        });

        await emailService.sendMail(
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

        return { success: true, data: {} };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const nextAuthLogin = async (email: string, password: string): Promise<ActionResponse<{ user: users }>> => {
    try {
        const user = await prisma.users.findFirst({
            where: {
                email: email,
            },
        });

        if (!user) return { success: false, error: "User not found" };
        if (!(await verifyPassword(password, user.password_hash))) return { success: false, error: "Invalid password" };

        if (user.disabled) return { success: false, error: "User account is disabled" };
        if (user.email_verified === false) return { success: false, error: "Email not verified" };

        return { success: true, data: { user } };
    } catch (error) {
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
};
