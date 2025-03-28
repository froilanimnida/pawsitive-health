"use server";
import { auth } from "@/auth";
import { PrismaClient, type vet_availability } from "@prisma/client";
import { getUserId } from "./user";

function getVeterinaryAvailability(): Promise<vet_availability[]>; // Logic for the veterinary role itself
function getVeterinaryAvailability(veterinarian_id: number): Promise<vet_availability[]>; // Logic for the user who wants to see the availability of a specific veterinarian

async function getVeterinaryAvailability(veterinarian_id?: number): Promise<vet_availability[]> {
    const prisma = new PrismaClient();
    if (veterinarian_id !== undefined) {
        const availability = await prisma.vet_availability.findMany({
            where: {
                vet_id: veterinarian_id,
            },
        });
        return Promise.resolve(availability);
    } else {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return Promise.reject("Not authorized to view clinic veterinarians");
        }
        const user_id = await getUserId(session?.user?.email);
        const availability = await prisma.vet_availability.findMany({
            where: {
                vet_id: user_id,
            },
        });
        return Promise.resolve(availability);
    }
}

export { getVeterinaryAvailability };
