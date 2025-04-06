"use server";
import { prisma } from "@/lib";
import type { ActionResponse } from "@/types/server-action-response";
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

function getClinic(clinic_id: number): Promise<ActionResponse<{ clinic: clinics }>>;
function getClinic(clinic_uuid: string): Promise<ActionResponse<{ clinic: clinics }>>;
async function getClinic(identifier: string | number): Promise<ActionResponse<{ clinic: clinics }>> {
    try {
        const where = typeof identifier === "string" ? { clinic_uuid: identifier } : { clinic_id: identifier };
        const clinic = await prisma.clinics.findUnique({
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
