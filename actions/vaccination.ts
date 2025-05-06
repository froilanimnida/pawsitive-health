"use server";
import { getCurrentUtcDate, prisma } from "@/lib";
import { type PetVaccinationType, PetVaccinationSchema } from "@/schemas";
import type { ActionResponse } from "@/types";
import type { vaccinations } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * This function creates a new vaccination record in the database.
 * It first validates the input data, then checks if the pet exists.
 * If the pet exists, it creates a new vaccination record.
 * @param {PetVaccinationType} values - The vaccination data to be created.
 * @returns {Promise<ActionResponse | void>} - An object indicating success or failure.
 */
const createVaccination = async (values: PetVaccinationType): Promise<ActionResponse | void> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.role) redirect("/signin");
    try {
        const data = PetVaccinationSchema.safeParse(values);
        if (!data.success) return { success: false, error: "Please check the form inputs" };
        const pet = await prisma.pets.findFirst({
            where: { pet_uuid: data.data.pet_uuid },
        });
        let veterinarian_id = null;
        if (session.user.role === "veterinarian") {
            const veterinatian = await prisma.veterinarians.findFirst({
                where: { user_id: Number(session.user.id) },
                select: { vet_id: true },
            });
            veterinarian_id = veterinatian?.vet_id;
        }

        if (!pet) return { success: false, error: "Pet not found" };

        const result = await prisma.vaccinations.create({
            data: {
                vaccine_name: data.data.vaccine_name,
                administered_date: data.data.administered_date,
                next_due_date: data.data.next_due_date,
                batch_number: data.data.batch_number || undefined,
                pet_id: pet.pet_id,
                administered_by: veterinarian_id,
                appointment_id: data.data.appointment_id,
                created_at: getCurrentUtcDate(),
            },
        });

        if (!result) return { success: false, error: "Failed to add vaccination" };
        if (session.user.role === "veterinarian") {
            revalidatePath(`/vet/appointments/${values.appointment_uuid}`);
        }
        revalidatePath(`/user/pet/${values.pet_uuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Get vaccination record(s) by different identifier types
 *
 * This function is overloaded to retrieve vaccination records based on:
 * 1. vaccination_uuid - For getting a single specific vaccination
 * 2. vaccination_id - For getting a single vaccination by ID
 * 3. appointment_id - For getting all vaccinations associated with an appointment
 * 4. pet_id - For getting all vaccinations for a specific pet
 *
 * @returns A promise with an ActionResponse containing the requested vaccination(s)
 */
async function getVaccination(vaccination_uuid: string): Promise<ActionResponse<{ vaccination: vaccinations }>>;
async function getVaccination(vaccination_id: number): Promise<ActionResponse<{ vaccination: vaccinations }>>;
async function getVaccination(param: {
    appointment_id: number;
}): Promise<ActionResponse<{ vaccinations: vaccinations[] }>>;
async function getVaccination(param: { pet_id: number }): Promise<ActionResponse<{ vaccinations: vaccinations[] }>>;

// Implementation that handles all the overloaded cases
async function getVaccination(
    param: string | number | { appointment_id: number } | { pet_id: number },
): Promise<ActionResponse<{ vaccination: vaccinations } | { vaccinations: vaccinations[] }>> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        // Case 1: Param is a string (vaccination_uuid)
        if (typeof param === "string") {
            const vaccination = await prisma.vaccinations.findFirst({
                where: { vaccination_uuid: param },
                include: {
                    pets: {
                        select: { name: true, profile_picture_url: true, species: true, breed: true },
                    },
                    veterinarians: {
                        select: {
                            users: { select: { first_name: true, last_name: true } },
                        },
                    },
                },
            });

            if (!vaccination) return { success: false, error: "Vaccination not found" };
            return { success: true, data: { vaccination } };
        }

        // Case 2: Param is a number (vaccination_id)
        else if (typeof param === "number") {
            const vaccination = await prisma.vaccinations.findFirst({
                where: { vaccination_id: param },
                include: {
                    pets: {
                        select: { name: true, profile_picture_url: true, species: true, breed: true },
                    },
                    veterinarians: {
                        select: {
                            users: { select: { first_name: true, last_name: true } },
                        },
                    },
                },
            });

            if (!vaccination) return { success: false, error: "Vaccination not found" };
            return { success: true, data: { vaccination } };
        }

        // Case 3: Param is an object with appointment_id
        else if ("appointment_id" in param) {
            const vaccinations = await prisma.vaccinations.findMany({
                where: { appointment_id: param.appointment_id },
                include: {
                    pets: {
                        select: { name: true, profile_picture_url: true, species: true, breed: true },
                    },
                    veterinarians: {
                        select: {
                            users: { select: { first_name: true, last_name: true } },
                        },
                    },
                },
                orderBy: { administered_date: "desc" },
            });

            return { success: true, data: { vaccinations } };
        }

        // Case 4: Param is an object with pet_id
        else if ("pet_id" in param) {
            const vaccinations = await prisma.vaccinations.findMany({
                where: { pet_id: param.pet_id },
                include: {
                    veterinarians: {
                        select: {
                            users: { select: { first_name: true, last_name: true } },
                        },
                    },
                    appointments: {
                        select: { appointment_uuid: true },
                    },
                },
                orderBy: { administered_date: "desc" },
            });

            return { success: true, data: { vaccinations } };
        }

        // Handle invalid parameter type
        return { success: false, error: "Invalid parameter type provided" };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * This function retrieves all vaccinations for a specific pet.
 * It first checks if the pet exists, and if it does, it fetches the vaccinations.
 * @param {number} pet_id - The id of the pet.
 * @returns {Promise<ActionResponse<{ vaccinations: vaccinations[] }>>} - An object containing the vaccinations or an error message.
 */
const getPetVaccinations = async (pet_id: number): Promise<ActionResponse<{ vaccinations: vaccinations[] | [] }>> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const vaccinations = await prisma.vaccinations.findMany({
            where: { pet_id: pet_id },
        });
        return { success: true, data: { vaccinations } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * This function deletes a vaccination record from the database. It only applies on appointment check-in.
 * It first checks if the vaccination exists, and if it does, it deletes it.
 * If the deletion is successful, it revalidates the path for the pet's page.
 * @param {number} vaccination_id - The id of the vaccination to delete.
 * @param {number} appointment_id - The id of the appointment.
 * @param {string} appointment_uuid - The uuid of the appointment.
 * @returns {Promise<ActionResponse>} - An object indicating success or failure.
 */
const deleteVaccination = async (
    vaccination_id: number,
    appointment_id: number,
    appointment_uuid: string,
    petUuid: string,
): Promise<ActionResponse | void> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const vaccination = await prisma.vaccinations.findFirst({
            where: { vaccination_id: vaccination_id, appointment_id: appointment_id },
        });
        if (!vaccination) return { success: false, error: "Vaccination not found" };
        const result = await prisma.vaccinations.delete({
            where: { vaccination_uuid: vaccination.vaccination_uuid, appointment_id: appointment_id },
        });
        if (!result) return { success: false, error: "Failed to delete vaccination" };
        if (session.user.role === "veterinarian") {
            revalidatePath(`/vet/appointments/${appointment_uuid}`);
        }
        revalidatePath(`/user/pets/${petUuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};
export { createVaccination, getPetVaccinations, getVaccination, deleteVaccination };
