"use server";
import { auth } from "@/auth";
import { AppointmentSchema } from "@/schemas/appointment-definition";
import { PrismaClient, type appointment_type } from "@prisma/client";
import type { z } from "zod";
import { getPet } from "./pets";
import { getUserId } from "./user";
import { endOfDay, startOfDay } from "date-fns";

async function getExistingAppointments(date: Date, vetId: number) {
    const prisma = new PrismaClient();

    try {
        const startDate = startOfDay(date);
        const endDate = endOfDay(date);

        const appointments = await prisma.appointments.findMany({
            where: {
                vet_id: vetId,
                appointment_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        return appointments;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
}

const getUserAppointments = async () => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const prisma = new PrismaClient();
        const appointments = await prisma.appointments.findMany({
            where: {
                pets: {
                    user_id: Number(session.user.id),
                },
            },
            include: {
                pets: true,
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
            },
        });

        return Promise.resolve(appointments);
    } catch (error) {
        return Promise.reject(error);
    }
};

const createUserAppointment = async (values: z.infer<typeof AppointmentSchema>) => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const prisma = new PrismaClient();
        const pet = await getPet(values.pet_uuid);
        if (!pet) {
            throw await Promise.reject("Pet not found");
        }
        const appointment = await prisma.appointments.create({
            data: {
                appointment_date: values.appointment_date,
                appointment_type: values.appointment_type as appointment_type,
                status: "requested",
                notes: values.notes,
                pet_id: pet?.pet_id,
                vet_id: Number(values.vet_id),
            },
        });

        return Promise.resolve(appointment);
    } catch (error) {
        return Promise.reject(error);
    }
};
const getClinicAppointments = async () => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const user_id = await getUserId(session?.user?.email);

        const prisma = new PrismaClient();

        const clinic = await prisma.clinics.findFirst({
            where: {
                user_id: user_id,
            },
        });

        if (!clinic) {
            throw new Error("No clinic found for this user");
        }

        const appointments = await prisma.appointments.findMany({
            where: {
                clinic_id: clinic.clinic_id,
            },
            include: {
                pets: {
                    include: {
                        users: true,
                    },
                },
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
                clinics: true,
            },
        });

        return Promise.resolve(appointments);
    } catch (error) {
        console.error("Error fetching clinic appointments:", error);
        return Promise.reject(error);
    }
};

export { getUserAppointments, createUserAppointment, getClinicAppointments, getExistingAppointments };
