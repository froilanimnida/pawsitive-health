"use server";
import { prisma } from "@/lib";
import { type MedicineType } from "@/schemas";
import type { ActionResponse } from "@/types";
import type { medications } from "@prisma/client";
import { revalidatePath } from "next/cache";

const getMedicationsList = async (): Promise<ActionResponse<{ medication: medications[] }>> => {
    try {
        const medicationsList = await prisma.medications.findMany({
            orderBy: { created_at: "desc" },
        });

        return { success: true, data: { medication: medicationsList } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const createMedication = async (values: MedicineType): Promise<ActionResponse | void> => {
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
        revalidatePath(`/admin/medications`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

export { getMedicationsList, createMedication };
