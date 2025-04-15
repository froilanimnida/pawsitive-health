"use server";

import { prisma } from "@/lib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { type ActionResponse } from "@/types/server-action-response";

/**
 * Gets upcoming vaccinations for the logged-in user's pets
 * Used for the dashboard "At a Glance" section
 */
export async function getUpcomingVaccinations(limit = 5): Promise<ActionResponse<{ vaccinations: any[] }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Get current date for comparison
        const today = new Date();

        // Get all active pets for the current user
        const userPets = await prisma.pets.findMany({
            where: {
                user_id: Number(session.user.id),
                deleted: false,
            },
            select: {
                pet_id: true,
                name: true,
                species: true,
                profile_picture_url: true,
            },
        });

        if (!userPets.length) {
            return { success: true, data: { vaccinations: [] } };
        }

        // Get pet IDs
        const petIds = userPets.map((pet) => pet.pet_id);

        // Get upcoming vaccinations for these pets
        const upcomingVaccinations = await prisma.vaccinations.findMany({
            where: {
                pet_id: {
                    in: petIds,
                },
                next_due_date: {
                    gte: today,
                },
            },
            orderBy: {
                next_due_date: "asc",
            },
            take: limit,
            include: {
                pets: {
                    select: {
                        name: true,
                        species: true,
                        profile_picture_url: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: {
                vaccinations: upcomingVaccinations,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch upcoming vaccinations",
        };
    }
}

/**
 * Gets upcoming prescription end dates or refills needed for the logged-in user's pets
 * Used for the dashboard "At a Glance" section
 */
export async function getUpcomingPrescriptions(limit = 5): Promise<ActionResponse<{ prescriptions: any[] }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Get current date for comparison
        const today = new Date();

        // Get all active pets for the current user
        const userPets = await prisma.pets.findMany({
            where: {
                user_id: Number(session.user.id),
                deleted: false,
            },
            select: {
                pet_id: true,
                name: true,
                species: true,
                profile_picture_url: true,
            },
        });

        if (!userPets.length) {
            return { success: true, data: { prescriptions: [] } };
        }

        // Get pet IDs
        const petIds = userPets.map((pet) => pet.pet_id);

        // Get upcoming prescription end dates or those with refills needed
        const upcomingPrescriptions = await prisma.prescriptions.findMany({
            where: {
                pet_id: {
                    in: petIds,
                },
                OR: [
                    {
                        end_date: {
                            gte: today,
                        },
                    },
                    {
                        refills_remaining: {
                            gt: 0,
                        },
                    },
                ],
            },
            orderBy: [
                {
                    end_date: "asc",
                },
                {
                    refills_remaining: "asc",
                },
            ],
            take: limit,
            include: {
                pets: {
                    select: {
                        name: true,
                        species: true,
                        profile_picture_url: true,
                    },
                },
                medications: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: {
                prescriptions: upcomingPrescriptions,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch upcoming prescriptions",
        };
    }
}

/**
 * Gets all upcoming healthcare events (vaccinations and prescriptions) for the user's dashboard
 * Used for the dashboard "At a Glance" section
 */
export async function getDashboardHealthcare(): Promise<
    ActionResponse<{
        vaccinations: any[];
        prescriptions: any[];
    }>
> {
    try {
        const [vaccinationsResponse, prescriptionsResponse] = await Promise.all([
            getUpcomingVaccinations(5),
            getUpcomingPrescriptions(5),
        ]);

        if (!vaccinationsResponse.success || !prescriptionsResponse.success) {
            return {
                success: false,
                error: "Failed to fetch dashboard healthcare data",
            };
        }

        return {
            success: true,
            data: {
                vaccinations: vaccinationsResponse.data?.vaccinations || [],
                prescriptions: prescriptionsResponse.data?.prescriptions || [],
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch dashboard healthcare data",
        };
    }
}
