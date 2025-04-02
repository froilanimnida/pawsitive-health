import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/types/server-action-response";
import type { medications } from "@prisma/client";

const getMedicationsList = async (): Promise<ActionResponse<{ medication: medications[] }>> => {
    try {
        const medicationsList = await prisma.medications.findMany({
            orderBy: {
                created_at: "desc",
            },
        });

        return {
            success: true,
            data: { medication: medicationsList },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { getMedicationsList };
