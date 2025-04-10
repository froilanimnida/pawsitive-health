"use server";
import { PrescriptionDefinition, type PrescriptionType } from "@/schemas";
import { prisma } from "@/lib";
import { ActionResponse } from "@/types/server-action-response";
import { getPetId, getUserId } from "@/actions";
import { auth } from "@/auth";

const addPrescription = async (values: PrescriptionType): Promise<ActionResponse<{ prescription_uuid: string }>> => {
    try {
        const formData = PrescriptionDefinition.safeParse(values);
        const session = await auth();
        if (!session || !session.user || !session.user.email) return { success: false, error: "User not found" };
        const user_id = await getUserId(session?.user?.email);
        if (!formData.success) {
            return {
                success: false,
                error: "Invalid prescription data",
            };
        }
        const petId = await getPetId(values.pet_uuid);
        if (!petId.success) {
            return {
                success: false,
                error: "Invalid pet UUID",
            };
        }

        const result = await prisma.prescriptions.create({
            data: {
                dosage: formData.data.dosage,
                frequency: formData.data.frequency,
                start_date: formData.data.start_date,
                pet_id: petId.data.pet_id,
                end_date: formData.data.end_date,
                refills_remaining: formData.data.refills_remaining,
                vet_id: user_id,
            },
        });
        if (!result) {
            return {
                success: false,
                error: "Failed to add prescription",
            };
        }
        return {
            success: true,
            data: { prescription_uuid: result.prescription_uuid },
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Failed to add prescription",
        };
    }
};

export { addPrescription };
