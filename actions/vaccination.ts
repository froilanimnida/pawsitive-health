"use server";
import { prisma } from "@/lib";
import { type PetVaccinationType, PetVaccinationSchema } from "@/schemas";
import { ActionResponse } from "@/types/server-action-response";
import type { vaccinations } from "@prisma/client";
import { getPet } from "./pets";

const createVaccination = async (values: PetVaccinationType): Promise<ActionResponse<{ vaccination_uuid: string }>> => {
    try {
        const data = PetVaccinationSchema.safeParse(values);
        if (!data.success) return { success: false, error: "Please check the form inputs" };
        const pet = await prisma.pets.findFirst({
            where: { pet_uuid: data.data.pet_uuid },
        });

        if (!pet) return { success: false, error: "Pet not found" };

        const result = await prisma.vaccinations.create({
            data: {
                vaccine_name: data.data.vaccine_name,
                administered_date: data.data.administered_date,
                next_due_date: data.data.next_due_date,
                batch_number: data.data.batch_number || undefined,
                pet_id: pet.pet_id,
            },
        });

        if (!result) return { success: false, error: "Failed to add vaccination" };

        return { success: true, data: { vaccination_uuid: result.vaccination_uuid } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const getVaccination = async (vaccination_uuid: string): Promise<ActionResponse<{ vaccination: vaccinations }>> => {
    try {
        const vaccination = await prisma.vaccinations.findFirst({
            where: { vaccination_uuid: vaccination_uuid },
        });

        if (!vaccination) return { success: false, error: "Vaccination not found" };

        return { success: true, data: { vaccination } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const getPetVaccinations = async (pet_uuid: string): Promise<ActionResponse<{ vaccinations: vaccinations[] }>> => {
    try {
        const pet = await getPet(pet_uuid);
        if (!pet || !pet.success || !pet.data?.pet) return { success: false, error: "Pet not found" };
        const vaccinations = await prisma.vaccinations.findMany({
            where: { pet_id: pet.data?.pet.pet_id },
        });
        return { success: true, data: { vaccinations } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

export { createVaccination, getPetVaccinations, getVaccination };
