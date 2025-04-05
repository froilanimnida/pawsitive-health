"use server";
import { prisma } from "@/lib";
import { type MedicineType } from "@/schemas";
import type { ActionResponse } from "@/types/server-action-response";
import type { medications } from "@prisma/client";

const getMedicationsList = async (): Promise<ActionResponse<{ medication: medications[] }>> => {
    try {
        const medicationsList = await prisma.medications.findMany({
            orderBy: {
                created_at: "desc",
            },
        });

        return {
            success: true,
            data: { medication: medicationsList },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const createMedication = async (values: MedicineType): Promise<ActionResponse<{ medication_uuid: string }>> => {
    try {
        const medications = await prisma.medications.create({
            data: {
                name: values.name,
                description: values.description,
                usage_instructions: values.usage_instructions,
                side_effects: values.side_effects,
            },
        });
        if (!medications || !medications.medication_uuid)
            return { success: false, error: "Failed adding new medicine" };
        return { success: true, data: { medication_uuid: medications.medication_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { getMedicationsList, createMedication };
