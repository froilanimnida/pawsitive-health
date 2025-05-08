"use server";
import { prisma } from "@/lib";
import type { ActionResponse } from "@/types";
import type { clinics } from "@prisma/client";

const getClinics = async (): Promise<ActionResponse<{ clinics: clinics[] }>> => {
    try {
        const clinics = await prisma.clinics.findMany();
        return { success: true, data: { clinics } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

// Fixed function overloads with proper typing
function getClinic(clinic_id: number, type?: "clinic_id"): Promise<ActionResponse<{ clinic: clinics }>>;
function getClinic(clinic_uuid: string): Promise<ActionResponse<{ clinic: clinics }>>;
function getClinic(user_id: number, type: "user_id"): Promise<ActionResponse<{ clinic: clinics }>>;
function getClinic(user_id: { user_id: number }): Promise<ActionResponse<{ clinic: clinics }>>;
async function getClinic(
    identifier: string | number | { user_id: number },
    type?: "clinic_id" | "user_id",
): Promise<ActionResponse<{ clinic: clinics }>> {
    try {
        let where: { clinic_uuid?: string; clinic_id?: number; user_id?: number };
        if (typeof identifier === "string") {
            where = { clinic_uuid: identifier };
        } else if (typeof identifier === "number") {
            if (type === "user_id") {
                where = { user_id: identifier };
            } else {
                where = { clinic_id: identifier };
            }
        } else {
            // Object with user_id
            where = { user_id: identifier.user_id };
        }

        const clinic = await prisma.clinics.findFirst({
            where,
        });

        if (!clinic) return { success: false, error: "Clinic not found" };
        return { success: true, data: { clinic } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

const getNearbyClinics = async (
    latitude: number,
    longitude: number,
): Promise<ActionResponse<{ clinics: clinics[] }>> => {
    try {
        const clinics = await prisma.clinics.findMany({
            where: {
                latitude: {
                    lt: latitude + 1,
                    gt: latitude - 1,
                },
                longitude: {
                    lt: longitude + 1,
                    gt: longitude - 1,
                },
            },
        });
        return { success: true, data: { clinics } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { getClinics, getNearbyClinics, getClinic };
