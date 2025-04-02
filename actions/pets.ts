"use server";
import { auth } from "@/auth";
import type { PetSchema } from "@/schemas/pet-definition";
import { type breed_type, type pet_sex_type, type species_type } from "@prisma/client";
import { z } from "zod";
import { getUserId } from "./user";
import { type ActionResponse } from "@/types/server-action-response";
import { prisma } from "@/lib/prisma";
import type { Pets } from "@/types/pets";
import { formatDecimal } from "@/lib/functions/format-decimal";

const addPet = async (values: z.infer<typeof PetSchema>): Promise<ActionResponse<{ pet_uuid: string }>> => {
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
                medical_history: values.medical_history,
                vaccination_status: values.vaccination_status,
                user_id: user_id,
            },
        });
        if (!pet) {
            throw await Promise.reject("Failed to add pet");
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
        // Make the weight_kg into a localized string
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

const updatePet = async (
    values: z.infer<typeof PetSchema>,
    pet_id: number,
): Promise<ActionResponse<{ pet_uuid: string }>> => {
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
                medical_history: values.medical_history,
                vaccination_status: values.vaccination_status,
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
