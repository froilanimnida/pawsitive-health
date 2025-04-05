"use server";
import { formatDecimal, prisma } from "@/lib";
import { PetOnboardingSchema, type PetType } from "@/schemas";
import { procedure_type, type breed_type, type pet_sex_type, type species_type } from "@prisma/client";
import { getUserId } from "@/actions";
import { auth } from "@/auth";
import { type ActionResponse } from "@/types/server-action-response";
import type { Pets } from "@/types/pets";

const addPet = async (values: PetOnboardingSchema): Promise<ActionResponse<{ pet_uuid: string }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw Promise.reject("User not found");
        }
        const user_id = await getUserId(session?.user?.email);
        const pet = await prisma.pets.create({
            data: {
                name: values.name,
                breed: values.breed as breed_type,
                sex: values.sex as pet_sex_type,
                species: values.species as species_type,
                date_of_birth: values.date_of_birth,
                weight_kg: values.weight_kg,
                user_id: user_id,
            },
        });

        if (!pet) throw await Promise.reject("Failed to add pet");

        if (values.healthcare) {
            if (values.healthcare.vaccinations?.length) {
                await prisma.vaccinations.createMany({
                    data: values.healthcare.vaccinations.map((vac) => ({
                        pet_id: pet.pet_id,
                        vaccine_name: vac.vaccine_name,
                        administered_date: vac.administered_date,
                        next_due_date: vac.next_due_date,
                        batch_number: vac.batch_number || undefined,
                    })),
                });
            }

            if (values.healthcare.procedures?.length) {
                await prisma.healthcare_procedures.createMany({
                    data: values.healthcare.procedures.map((proc) => ({
                        pet_id: pet.pet_id,
                        procedure_type: proc.procedure_type as procedure_type,
                        procedure_date: proc.procedure_date,
                        next_due_date: proc.next_due_date,
                        product_used: proc.product_used,
                        dosage: proc.dosage,
                        notes: proc.notes,
                    })),
                });
            }
        }
        return { success: true, data: { pet_uuid: pet.pet_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getPet = async (pet_uuid: string): Promise<ActionResponse<{ pet: Pets }>> => {
    try {
        const pet = await prisma.pets.findUnique({
            where: {
                pet_uuid: pet_uuid,
            },
        });
        if (!pet) return { success: false, error: "Pet not found" };
        const petInfo = {
            ...pet,
            weight_kg: formatDecimal(pet.weight_kg),
        };
        return { success: true, data: { pet: petInfo } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const updatePet = async (values: PetType, pet_id: number): Promise<ActionResponse<{ pet_uuid: string }>> => {
    try {
        const pet = await prisma.pets.update({
            where: {
                pet_id: pet_id,
            },
            data: {
                name: values.name,
                breed: values.breed as breed_type,
                sex: values.sex as pet_sex_type,
                species: values.species as species_type,
                weight_kg: values.weight_kg,
            },
        });
        if (!pet) return { success: false, error: "Failed to update pet" };
        return { success: true, data: { pet_uuid: pet.pet_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getPets = async (): Promise<ActionResponse<{ pets: Pets[] }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }

        const userId = await getUserId(session?.user?.email);
        const petsData = await prisma.pets.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                date_of_birth: "desc",
            },
        });

        if (!petsData || petsData.length === 0) {
            return { success: true, data: { pets: [] } };
        }

        const pets = petsData.map((pet) => ({
            ...pet,
            weight_kg: formatDecimal(pet.weight_kg),
        }));
        return { success: true, data: { pets } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { addPet, getPet, updatePet, getPets };
