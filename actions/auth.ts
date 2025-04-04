"use server";
import { prisma } from "@/lib/prisma";
import { SignUpSchema } from "@/schemas/auth-definitions";
import type { z } from "zod";
import { role_type, type users } from "@prisma/client";
import { signOut } from "next-auth/react";
import { NewClinicAccountSchema } from "@/schemas/clinic-signup-definition";
import { hashPassword, verifyPassword } from "@/lib/functions/security/password-check";
import type { ActionResponse } from "@/types/server-action-response";
import jwt from "jsonwebtoken";
import { generateVerificationToken } from "@/lib/functions/security/generate-verification-token";

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
        const result = await prisma.users.create({
            data: {
                email: formData.data.email,
                password_hash: await hashPassword(formData.data.password),
                first_name: formData.data.first_name,
                last_name: formData.data.last_name,
                phone_number: formData.data.phone_number,
                role: role_type.user,
                email_verified: false,
                email_verification_token: generateVerificationToken(formData.data.email),
                email_verification_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        if (result.user_id === null) return { success: false, error: "Failed to create account" };
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
        const result = await prisma.users.create({
            data: {
                email: formData.data.email,
                password_hash: await hashPassword(values.password),
                first_name: formData.data.first_name,
                last_name: formData.data.last_name,
                phone_number: formData.data.phone_number,
                role: role_type.client,
                email_verified: false,
                email_verification_token: generateVerificationToken(formData.data.email),
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
        if (clinicResult.clinic_id === null) {
            return { success: false, error: "Failed to create clinic account" };
        }
        return { success: true, data: { user_uuid: result.user_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const loginAccount = async (email: string, password: string): Promise<ActionResponse<{ user: users }>> => {
    try {
        const user = await prisma.users.findFirst({
            where: {
                email: email,
            },
        });
        if (user === null) return { success: false, error: "User not found" };
        if (!(await verifyPassword(password, user.password_hash))) return { success: false, error: "Invalid password" };
        return { success: true, data: { user: user } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

// export const createVeterinarianAccount

export { loginAccount, createAccount, createClinicAccount, logout, verifyEmail };
