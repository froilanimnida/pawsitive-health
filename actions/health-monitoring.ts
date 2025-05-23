"use server";

import { prisma } from "@/lib/prisma";
import { HealthMonitoringSchema, type HealthMonitoringType } from "@/schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import type { ActionResponse, Modify } from "@/types";
import { revalidatePath } from "next/cache";
import { formatDecimal, getCurrentUtcDate } from "@/lib";
import type { health_monitoring } from "@prisma/client";

/**
 * Add a new health monitoring record for a pet
 */
export async function addHealthMonitoringRecord(
    values: HealthMonitoringType,
): Promise<ActionResponse<{ monitoring_id: number }> | void> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const data = HealthMonitoringSchema.safeParse(values);
        if (!data.success) return { success: false, error: "Please check the form inputs" };

        const pet = await prisma.pets.findFirst({
            where: {
                pet_id: values.pet_id,
                user_id: Number(session.user.id),
            },
        });

        if (!pet) return { success: false, error: "Pet not found" };

        const healthMonitoring = await prisma.health_monitoring.create({
            data: {
                pet_id: values.pet_id,
                activity_level: values.activity_level,
                weight_kg: values.weight_kg,
                temperature_celsius: values.temperature_celsius,
                symptoms: values.symptoms,
                notes: values.notes || "",
                recorded_at: getCurrentUtcDate(),
            },
        });
        await prisma.pets.update({
            where: {
                pet_id: values.pet_id,
            },
            data: {
                weight_kg: values.weight_kg,
            },
        });
        revalidatePath(`/user/pets/${values.pet_uuid}`);
        return { success: true, data: { monitoring_id: healthMonitoring.monitoring_id } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Get health monitoring records for a pet
 * @param petId - The ID of the pet
 * @return - An object containing the health monitoring records
 */
export async function getPetHealthMonitoring(petId: number): Promise<
    ActionResponse<{
        healthMonitoring: Modify<health_monitoring, { temperature_celsius: string; weight_kg: string }>[] | [];
    }>
> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const healthMonitoring = await prisma.health_monitoring.findMany({
            where: { pet_id: petId },
            orderBy: { recorded_at: "desc" },
        });

        const formattedHealthMonitoring = healthMonitoring.map((r) => ({
            ...r,
            temperature_celsius: formatDecimal(r.temperature_celsius),
            weight_kg: formatDecimal(r.weight_kg),
        }));

        return { success: true, data: { healthMonitoring: formattedHealthMonitoring } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
}

/**
 * Delete a health monitoring record
 */
export async function deleteHealthMonitoringRecord(
    monitoringId: number,
    petUuid: string,
): Promise<ActionResponse<boolean> | void> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const healthMonitoring = await prisma.health_monitoring.findFirst({
            where: {
                monitoring_id: monitoringId,
                pets: {
                    user_id: Number(session.user.id),
                },
            },
        });

        if (!healthMonitoring) return { success: false, error: "Health monitoring record not found" };

        await prisma.health_monitoring.delete({
            where: {
                monitoring_id: monitoringId,
            },
        });

        revalidatePath(`/user/pets/${petUuid}`);
        return { success: true, data: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
