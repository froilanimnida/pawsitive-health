"use server";
import { prisma } from "@/lib";
import { auth } from "@/auth";
import { type ActionResponse } from "@/types/server-action-response";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

// Schema for user profile updates
const UserProfileSchema = z.object({
    first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
    last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone_number: z.string().min(10, { message: "Please enter a valid phone number" }),
});

type UserProfileUpdate = z.infer<typeof UserProfileSchema>;

/**
 * Update a user's profile information
 */
const updateUserProfile = async (data: UserProfileUpdate): Promise<ActionResponse<{ updated: boolean }>> => {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "User not authenticated" };
        }

        // Validate input
        const validated = UserProfileSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: "Invalid input data" };
        }

        // Check if user exists
        const userId = await getUserId(session.user.email);

        // Check if new email is already taken by another user
        if (data.email !== session.user.email) {
            const existingUser = await prisma.users.findUnique({
                where: { email: data.email },
            });

            if (existingUser && existingUser.user_id !== userId) {
                return { success: false, error: "Email address is already in use" };
            }
        }

        // Update the user
        await prisma.users.update({
            where: { user_id: userId },
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone_number: data.phone_number,
            },
        });

        revalidatePath("/user/settings");
        return { success: true, data: { updated: true } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
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
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { getUserId, updateUserProfile, updateCalendarIntegration };
