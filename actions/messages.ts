"use server";
import { prisma } from "@/lib";
import { ActionResponse } from "@/types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserId } from "@/actions";

/**
 * Sends a message in the context of an appointment
 */
const sendMessage = async (text: string, appointment_id: number): Promise<ActionResponse> => {
    try {
        const user = await auth();
        if (!user || !user.user?.email) redirect("/auth/login");
        const user_data = await getUserId(user.user.email);

        if (!appointment_id) {
            return {
                success: false,
                error: "Appointment not found",
            };
        }

        // Get the appointment to determine the receiver
        const appointment = await prisma.appointments.findUnique({
            where: { appointment_id },
            include: {
                pets: {
                    include: { users: true },
                },
                veterinarians: {
                    include: { users: true },
                },
            },
        });

        if (!appointment) {
            return {
                success: false,
                error: "Appointment not found",
            };
        }

        // Determine the sender and receiver IDs based on the current user's role
        const currentUserId = Number(user_data);
        let receiverId: number;

        // If the current user is the pet owner, send to the vet
        if (appointment.pets?.users?.user_id === currentUserId) {
            if (!appointment.veterinarians?.users?.user_id) {
                return {
                    success: false,
                    error: "Veterinarian not found for this appointment",
                };
            }
            receiverId = appointment.veterinarians.users.user_id;
        }
        // If the current user is the vet, send to the pet owner
        else if (appointment.veterinarians?.users?.user_id === currentUserId) {
            if (!appointment.pets?.users?.user_id) {
                return {
                    success: false,
                    error: "Pet owner not found for this appointment",
                };
            }
            receiverId = appointment.pets.users.user_id;
        } else {
            return {
                success: false,
                error: "You are not associated with this appointment",
            };
        }

        const message = await prisma.messages.create({
            data: {
                appointment_id,
                receiver_id: receiverId,
                content: text,
                sender_id: currentUserId,
            },
        });

        return {
            success: true,
            data: message,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

/**
 * Gets all messages for a specific appointment
 */
const getMessages = async (appointment_id: number): Promise<ActionResponse> => {
    try {
        const user = await auth();
        if (!user || !user.user?.email) redirect("/auth/login");

        if (!appointment_id) {
            return {
                success: false,
                error: "Appointment not found",
            };
        }

        // Verify the user has access to this appointment
        const userId = await getUserId(user.user.email);
        const appointment = await prisma.appointments.findUnique({
            where: { appointment_id },
            include: {
                pets: {
                    include: { users: true },
                },
                veterinarians: {
                    include: { users: true },
                },
            },
        });

        if (!appointment) {
            return {
                success: false,
                error: "Appointment not found",
            };
        }

        // Check if the user is either the pet owner or the vet for this appointment
        const currentUserId = Number(userId);
        const isPetOwner = appointment.pets?.users?.user_id === currentUserId;
        const isVet = appointment.veterinarians?.users?.user_id === currentUserId;

        if (!isPetOwner && !isVet) {
            return {
                success: false,
                error: "You don't have permission to view these messages",
            };
        }

        // Get messages for this appointment
        const messages = await prisma.messages.findMany({
            where: {
                appointment_id,
                OR: [{ sender_id: currentUserId }, { receiver_id: currentUserId }],
            },
            include: {
                sender: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                receiver: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                created_at: "asc",
            },
        });

        // Mark unread messages as read if they were sent to the current user
        await prisma.messages.updateMany({
            where: {
                appointment_id,
                receiver_id: currentUserId,
                is_read: false,
            },
            data: {
                is_read: true,
                updated_at: new Date(),
            },
        });

        return {
            success: true,
            data: { messages },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { sendMessage, getMessages };
