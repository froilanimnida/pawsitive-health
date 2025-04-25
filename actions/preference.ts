"use server";

import { ThemeSchema, type ThemeType } from "@/schemas";
import { prisma } from "@/lib";
import { ActionResponse } from "@/types";
import type { user_settings } from "@prisma/client";

const changeTheme = async (values: ThemeType): Promise<ActionResponse<{ success: boolean }>> => {
    try {
        const formData = ThemeSchema.safeParse(values);
        if (!formData.success) return { success: false, error: "Invalid input data" };
        await prisma.user_settings.update({
            where: { user_id: Number(formData.data.user_id) },
            data: { theme_mode: formData.data.theme_mode },
        });

        return { success: true, data: { success: true } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const createNewPreferenceDefault = async (user_id: number): Promise<ActionResponse<{ updated_at: Date }>> => {
    try {
        const result = await prisma.user_settings.create({
            data: {
                user_id,
            },
        });
        return { success: true, data: { updated_at: result.updated_at } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getUserPreference = async (user_id: number): Promise<ActionResponse<{ user_settings: user_settings }>> => {
    try {
        const result = await prisma.user_settings.findUnique({
            where: { user_id },
        });
        if (!result) return { success: false, error: "User settings not found" };
        return { success: true, data: { user_settings: result } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getCalendarSyncPreference = async (
    user_id: number,
): Promise<
    ActionResponse<{
        google_calendar_sync: boolean;
        google_calendar_token: string | null;
    }>
> => {
    try {
        const result = await prisma.user_settings.findUnique({
            where: { user_id },
            select: { google_calendar_sync: true, google_calendar_token: true },
        });
        if (!result) return { success: false, error: "User settings not found" };
        return {
            success: true,
            data: {
                google_calendar_sync: result.google_calendar_sync,
                google_calendar_token: result.google_calendar_token,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getThemePreference = async (user_id: string): Promise<ActionResponse<{ theme_mode: string }>> => {
    try {
        const result = await prisma.user_settings.findUnique({
            where: { user_id: Number(user_id) },
            select: { theme_mode: true },
        });
        if (!result) return { success: false, error: "User settings not found" };
        return { success: true, data: { theme_mode: result.theme_mode } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { changeTheme, createNewPreferenceDefault, getUserPreference, getCalendarSyncPreference, getThemePreference };
