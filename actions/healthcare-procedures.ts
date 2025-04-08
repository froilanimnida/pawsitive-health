"use server";

import { prisma } from "@/lib";
import { ProcedureSchema, type ProcedureType } from "@/schemas";
import type { ActionResponse } from "@/types/server-action-response";
import type { healthcare_procedures, procedure_type } from "@prisma/client";

const addHealthcareProcedure = async (values: ProcedureType): Promise<ActionResponse<{ procedure_uuid: string }>> => {
    try {
        const data = ProcedureSchema.safeParse(values);
        if (!data.success) {
            return {
                success: false,
                error: "Please check the form inputs",
            };
        }
        const pet = await prisma.pets.findFirst({
            where: {
                pet_uuid: data.data.pet_uuid,
            },
        });
        if (!pet)
            return {
                success: false,
                error: "Pet not found",
            };

        const result = await prisma.healthcare_procedures.create({
            data: {
                procedure_type: data.data.procedure_type as procedure_type,
                procedure_date: data.data.procedure_date,
                next_due_date: data.data.next_due_date,
                product_used: data.data.product_used,
                dosage: data.data.dosage,
                notes: data.data.notes,
                pet_id: pet.pet_id,
            },
        });
        if (!result) {
            return {
                success: false,
                error: "Failed to add healthcare procedure",
            };
        }
        return {
            success: true,
            data: { procedure_uuid: result.procedure_uuid },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getHealthcareProcedures = async (
    pet_uuid: string,
): Promise<ActionResponse<{ procedures: healthcare_procedures[] }>> => {
    try {
        const pet = await prisma.pets.findFirst({
            where: {
                pet_uuid: pet_uuid,
            },
        });
        if (!pet)
            return {
                success: false,
                error: "Pet not found",
            };
        const procedures = await prisma.healthcare_procedures.findMany({
            where: {
                pet_id: pet.pet_id,
            },
            orderBy: {
                procedure_date: "desc",
            },
        });
        if (!procedures) {
            return {
                success: false,
                error: "Failed to get healthcare procedures",
            };
        }
        return {
            success: true,
            data: {
                procedures: procedures,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getHealthcareProcedure = async (
    procedure_uuid: string,
): Promise<ActionResponse<{ healthcare_procedure: healthcare_procedures }>> => {
    try {
        const procedure = await prisma.healthcare_procedures.findFirst({
            where: {
                procedure_uuid: procedure_uuid,
            },
        });
        if (!procedure)
            return {
                success: false,
                error: "Failed to get the healthcare procedure",
            };
        return {
            success: true,
            data: { healthcare_procedure: procedure },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { addHealthcareProcedure, getHealthcareProcedures, getHealthcareProcedure };
