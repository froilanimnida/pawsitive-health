"use server";

import { prisma } from "@/lib/prisma";

export async function getPetAppointments(petId: number) {
    try {
        const appointments = await prisma.appointments.findMany({
            where: { pet_id: petId },
            include: {
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
                clinics: true,
            },
            orderBy: {
                appointment_date: "desc",
            },
        });

        return {
            success: true,
            data: { appointments },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch pet appointments",
        };
    }
}

export async function getPetVaccinations(petId: number) {
    try {
        const vaccinations = await prisma.vaccinations.findMany({
            where: { pet_id: petId },
            include: {
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
            },
            orderBy: {
                administered_date: "desc",
            },
        });

        return {
            success: true,
            data: { vaccinations },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch pet vaccinations",
        };
    }
}

export async function getPetProcedures(petId: number) {
    try {
        const procedures = await prisma.healthcare_procedures.findMany({
            where: { pet_id: petId },
            include: {
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
            },
            orderBy: {
                procedure_date: "desc",
            },
        });

        return {
            success: true,
            data: { procedures },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch pet procedures",
        };
    }
}

export async function getPetPrescriptions(petId: number) {
    try {
        const prescriptions = await prisma.prescriptions.findMany({
            where: { pet_id: petId },
            include: {
                medications: true,
                veterinarians: {
                    select: {
                        users: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return {
            success: true,
            data: { prescriptions },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch pet prescriptions",
        };
    }
}
