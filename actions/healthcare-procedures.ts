"use server";

import { prisma } from "@/lib";
import { ProcedureSchema, type ProcedureType } from "@/schemas";
import type { ActionResponse } from "@/types/server-action-response";
import type { healthcare_procedures, procedure_type } from "@prisma/client";

// TODO: Add intent parameter to conditionally revalidateCache based on the doer of the action like if vet refresh like /vet/something of if user refresh like /user/something
const addHealthcareProcedure = async (
    values: ProcedureType | ProcedureType[],
): Promise<ActionResponse<{ data: object }>> => {
    try {
        const proceduresArray = Array.isArray(values) ? values : [values];

        const results = await Promise.all(
            proceduresArray.map(async (procedure) => {
                const data = ProcedureSchema.safeParse(procedure);
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

                if (!pet) {
                    return {
                        success: false,
                        error: `Pet with UUID ${data.data.pet_uuid} not found`,
                    };
                }

                return prisma.healthcare_procedures.create({
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
            }),
        );

        // Fix: Filter out any results that have a 'success: false' property
        // These are our error objects, not valid procedure objects
        const validResults = results.filter((result) => !("success" in result && result.success === false));

        return {
            success: true,
            data: { data: validResults },
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
