"use server";
import { role_type } from "@prisma/client";
import { VeterinarianSchema } from "@/schemas/veterinarian-definition";
import { hashPassword } from "@/lib/functions/security/password-check";
import { PrismaClient, type veterinary_specialization } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { getUserId } from "./user";

const newVeterinarian = async (values: z.infer<typeof VeterinarianSchema>) => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return Promise.reject("Not authorized to create a veterinarian");
        }
        const user_id = await getUserId(session?.user?.email);

        const formData = await VeterinarianSchema.parseAsync(values);
        const prisma = new PrismaClient();

        const user = await prisma.users.findFirst({
            where: {
                OR: [{ email: formData.email }, { phone_number: formData.phone_number }],
            },
        });

        if (user !== null) {
            return Promise.reject("User already exists");
        }

        const clinic = await prisma.clinics.findFirst({
            where: {
                user_id: user_id,
            },
        });

        if (!clinic) {
            return Promise.reject("No clinic found for this user");
        }

        const result = await prisma.users.create({
            data: {
                email: formData.email,
                password_hash: await hashPassword(formData.password),
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_number: formData.phone_number,
                role: role_type.veterinarian,
            },
        });

        if (result.user_id === null) {
            return Promise.reject("Failed to create account");
        }

        const veterinarian = await prisma.veterinarians.create({
            data: {
                license_number: formData.license_number,
                user_id: result.user_id,
                specialization: formData.specialization as veterinary_specialization,
            },
        });

        // Link the veterinarian to the clinic
        const linkVet = await prisma.clinic_veterinarians.create({
            data: {
                clinic_id: clinic.clinic_id,
                vet_id: veterinarian.vet_id,
            },
        });

        // Optionally set up initial availability for the vet based on clinic hours
        const clinicHours = await prisma.clinic_hours.findMany({
            where: {
                clinic_id: clinic.clinic_id,
                is_closed: false,
            },
        });

        // Create default availability entries for each clinic day
        const availabilityPromises = clinicHours.map((hour) =>
            prisma.vet_availability.create({
                data: {
                    vet_id: veterinarian.vet_id,
                    clinic_id: clinic.clinic_id,
                    day_of_week: hour.day_of_week,
                    start_time: hour.opens_at,
                    end_time: hour.closes_at,
                    is_available: true,
                },
            }),
        );

        await Promise.all(availabilityPromises);

        return Promise.resolve({
            success: true,
            user: result,
            veterinarian: veterinarian,
        });
    } catch (error) {
        console.error("Error creating veterinarian:", error);
        return Promise.reject(error);
    }
};

const getClinicVeterinarians = async () => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return Promise.reject("Not authorized to view clinic veterinarians");
        }
        const user_id = await getUserId(session?.user?.email);

        const prisma = new PrismaClient();

        const clinic = await prisma.clinics.findFirst({
            where: {
                user_id: user_id,
            },
        });

        if (!clinic) {
            return Promise.reject("No clinic found for this user");
        }

        const clinicVeterinarians = await prisma.clinic_veterinarians.findMany({
            where: {
                clinic_id: clinic.clinic_id,
            },
            include: {
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
            },
        });

        const veterinarians = clinicVeterinarians.map((cv) => ({
            ...cv.veterinarians,
        }));

        return Promise.resolve(veterinarians);
    } catch (error) {
        console.error("Error getting clinic veterinarians:", error);
        return Promise.reject(error);
    }
};

const getVeterinariansByClinic = async (clinicId: string) => {
    try {
        if (!clinicId) return [];
        const prisma = new PrismaClient();
        const clinicVeterinarians = await prisma.clinic_veterinarians.findMany({
            where: {
                clinic_id: Number(clinicId),
            },
            include: {
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
            },
        });
        if (!clinicVeterinarians || clinicVeterinarians.length === 0) {
            return [];
        }

        return clinicVeterinarians.map((cv) => ({
            id: cv.veterinarians.vet_id.toString(),
            name: cv.veterinarians.users
                ? `${cv.veterinarians.users.first_name} ${cv.veterinarians.users.last_name}`
                : "Unknown",
            specialization: cv.veterinarians.specialization,
        }));
    } catch (error) {
        console.error("Error fetching veterinarians:", error);
        return [];
    }
};

export { newVeterinarian, getClinicVeterinarians, getVeterinariansByClinic };
