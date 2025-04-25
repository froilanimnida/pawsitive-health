"use server";
import { type vet_availability } from "@prisma/client";
import { prisma } from "@/lib";
import type { ActionResponse } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

function getVeterinaryAvailability(): Promise<ActionResponse<{ availability: vet_availability[] }>>; // Logic for the veterinary role itself
function getVeterinaryAvailability(
    veterinarian_id: number,
): Promise<ActionResponse<{ availability: vet_availability[] }>>; // Logic for the user who wants to see the availability of a specific veterinarian

async function getVeterinaryAvailability(
    veterinarian_id?: number,
): Promise<ActionResponse<{ availability: vet_availability[] }>> {
    if (veterinarian_id !== undefined) {
        const availability = await prisma.vet_availability.findMany({
            where: { vet_id: veterinarian_id },
        });
        return { success: true, data: { availability } };
    } else {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
        const availability = await prisma.vet_availability.findMany({
            where: { vet_id: Number(session.user.id) },
        });
        return { success: true, data: { availability } };
    }
}

export { getVeterinaryAvailability };
