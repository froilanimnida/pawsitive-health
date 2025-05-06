"use server";
import { prisma } from "@/lib";
import { type ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BaseUserProfileSchema, type BaseUserProfileType } from "@/schemas";
import { redirect } from "next/navigation";
import type { users } from "@prisma/client";

const getUserId = async (email: string) => {
    const user = await prisma.users.findUnique({
        where: {
            email: email,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user.user_id;
};

/**
 * Update a user's profile information
 */
const updateUserProfile = async (data: BaseUserProfileType): Promise<ActionResponse | void> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const validated = BaseUserProfileSchema.safeParse(data);
        if (!validated.success) return { success: false, error: "Invalid input data" };

        if (data.email !== session.user.email) {
            const existingUser = await prisma.users.findUnique({
                where: { email: data.email },
            });

            if (existingUser && existingUser.user_id !== Number(session.user.id))
                return { success: false, error: "Email address is already in use" };
        }

        await prisma.users.update({
            where: { user_id: Number(session.user.id) },
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone_number: data.phone_number,
            },
        });

        revalidatePath("/user/settings");
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Update user's calendar integration settings
 */
const updateCalendarIntegration = async (settings: {
    syncEnabled: boolean;
    token?: string;
}): Promise<ActionResponse<{ updated: boolean }>> => {
    try {
        // Update or create user settings
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) return { success: false, error: "User not authenticated" };

        // If connecting for the first time, set last_sync to the current time
        // This happens when token is present but syncEnabled was previously false
        const currentSettings = await prisma.user_settings.findUnique({
            where: { user_id: Number(session.user?.id) },
        });

        const updateData = {
            google_calendar_sync: settings.syncEnabled,
            google_calendar_token: settings.token || null,
            last_sync: settings.token ? new Date() : null,
        };

        // Set last_sync timestamp in two cases:
        // 1. When newly connecting (token is provided)
        // 2. When turning on sync for an already connected account
        if (
            (settings.token && (!currentSettings?.google_calendar_token || !currentSettings.google_calendar_sync)) ||
            (settings.syncEnabled &&
                currentSettings &&
                !currentSettings.google_calendar_sync &&
                currentSettings.google_calendar_token)
        ) {
            updateData.last_sync = new Date();
        }

        // If disconnecting, clear the last_sync timestamp
        if (!settings.syncEnabled && currentSettings?.google_calendar_sync) {
            updateData.last_sync = null;
        }

        await prisma.user_settings.upsert({
            where: { user_id: Number(session.user?.id) },
            update: updateData,
            create: {
                user_id: Number(session.user?.id),
                google_calendar_sync: settings.syncEnabled,
                google_calendar_token: settings.token || null,
                last_sync: settings.token ? new Date() : null,
            },
        });

        return { success: true, data: { updated: true } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

function getUser(user_id: number): Promise<ActionResponse<{ user: users }>>;
function getUser(user_uuid: string): Promise<ActionResponse<{ user: users }>>;
async function getUser(identifier: string | number): Promise<ActionResponse<{ user: users }>> {
    try {
        const where = typeof identifier === "string" ? { user_uuid: identifier } : { user_id: identifier };
        const user = await prisma.users.findUnique({
            where,
        });
        if (!user) return { success: false, error: "User not found" };
        return { success: true, data: { user } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

export { getUserId, updateUserProfile, updateCalendarIntegration, getUser };
