"use server";
import { prisma } from "@/lib";
import { ActionResponse } from "@/types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserId } from "@/actions";

const sendMessage = async (text: string, appointment_id: number): Promise<ActionResponse | void> => {
    try {
        const user = await auth();
        if (!user || !user.user?.email) redirect("/auth/login");
        const user_data = await getUserId(user.user.email);
        // TODO: We need to get the receiver id from the appointment
        if (!appointment_id) {
            return {
                success: false,
                error: "Appointment not found",
            };
        }

        await prisma.messages.create({
            data: {
                appointment_id: appointment_id,
                receiver_id: 1, // TODO: Get the receiver id from the appointment
                content: text,
                sender_id: Number(user_data),
            },
        });

        return;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getMessages = async (appointment_id: number): Promise<ActionResponse | void> => {
    try {
        const user = await auth();
        if (!user || !user.user?.email) redirect("/auth/login");
        if (appointment_id) {
            return {
                success: false,
                error: "Appointment not found",
            };
        }

        await prisma.messages.findMany({
            where: {
                appointment_id: appointment_id,
            },
            orderBy: {
                created_at: "asc",
            },
        });

        return;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { sendMessage, getMessages };
