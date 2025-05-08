import { prisma } from "@/lib";
import { type ActionResponse } from "@/types";
import { type clinic_hours } from "@prisma/client";

async function getClinicSchedule(clinic_id: number): Promise<ActionResponse<{ clinic_hours: clinic_hours[] }>>;
async function getClinicSchedule(user_id: string): Promise<ActionResponse<{ clinic_hours: clinic_hours[] }>>;
async function getClinicSchedule(id: number | string): Promise<ActionResponse<{ clinic_hours: clinic_hours[] }>> {
    try {
        const clinicHours = await prisma.clinic_hours.findMany({
            where: {
                clinic_id: typeof id === "string" ? Number(id) : id,
            },
        });
        if (clinicHours.length === 0) return { success: true, data: { clinic_hours: [] } };
        return { success: true, data: { clinic_hours: clinicHours } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
}

export { getClinicSchedule };
