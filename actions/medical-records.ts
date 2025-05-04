"use server"

import {prisma} from "@/lib"
import type {ActionResponse} from "@/types";
import {medical_records} from "@prisma/client";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {redirect} from "next/navigation";

const getMedicalRecords = async (pet_id: number): Promise<ActionResponse<{ medicalRecords: medical_records[] | [] }>> => {
    const session = getServerSession(authOptions);
    if (!session) redirect("/signin");
    try {
        const medicalRecords = await prisma.medical_records.findMany({
            where: {
                pet_id: pet_id,
            },
        });
        return { success: true, data: { medicalRecords } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }

}

export { getMedicalRecords };
