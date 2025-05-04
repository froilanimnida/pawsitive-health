"use server";
import { getCurrentUtcDate, prisma } from "@/lib";
import { ActionResponse, type Modify } from "@/types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { appointments, messages } from "@prisma/client";

// Utility function to mark messages as read
const markMessagesAsRead = async (appointmentId: number, receiverId: number): Promise<void> => {
    await prisma.messages.updateMany({
        where: {
            appointment_id: appointmentId,
            receiver_id: receiverId,
            is_read: false,
        },
        data: {
            is_read: true,
            updated_at: getCurrentUtcDate(),
        },
    });
};

const verifyAppointmentAccess = async (
    appointmentId: number,
    userId: number,
): Promise<{
    success: boolean;
    appointment?: appointments;
    error?: string;
    isPetOwner?: boolean;
    isVet?: boolean;
}> => {
    if (!appointmentId) {
        return { success: false, error: "Appointment ID is required" };
    }

    const appointment = await prisma.appointments.findUnique({
        where: { appointment_id: appointmentId },
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
        return { success: false, error: "Appointment not found" };
    }

    // Check if the user is either the pet owner or the vet for this appointment
    const isPetOwner = appointment.pets?.users?.user_id === userId;
    const isVet = appointment.veterinarians?.users?.user_id === userId;

    if (!isPetOwner && !isVet) {
        return { success: false, error: "You don't have permission to access this appointment" };
    }

    return { success: true, appointment, isPetOwner, isVet };
};

/**
 * Sends a message in the context of an appointment
 */
const sendMessage = async (
    text: string,
    appointment_id: number,
    receiverId: number,
): Promise<ActionResponse<messages>> => {
    const user = await getServerSession(authOptions);
    if (!user || !user.user?.email) redirect("/signin");
    try {
        if (!appointment_id) return { success: false, error: "Appointment not found" };

        const currentUserId = Number(user.user.id);

        // If receiverId is provided directly, use it
        if (receiverId) {
            // Create the message with the provided receiver ID
            console.log("Receiver ID provided:", receiverId);
            console.log("Current User ID:", user.user.id);
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
        }

        // Fall back to inferring from previous messages if no receiverId provided
        let inferredReceiverId: number | undefined;

        // Try to infer the receiver from previous messages in this appointment
        const previousMessages = await prisma.messages.findMany({
            where: { appointment_id },
            orderBy: { created_at: "desc" },
            take: 5, // Looking at the most recent messages should be sufficient
        });

        if (previousMessages.length > 0) {
            // Find a message where the current user was either sender or receiver
            const relevantMessage = previousMessages.find(
                (msg) => msg.sender_id === currentUserId || msg.receiver_id === currentUserId,
            );

            if (relevantMessage) {
                // If user was the sender before, the receiver is the same as the previous message's receiver
                // If user was the receiver before, the receiver is the previous message's sender
                inferredReceiverId =
                    relevantMessage.sender_id === currentUserId
                        ? relevantMessage.receiver_id
                        : relevantMessage.sender_id;
            }
        }

        // If we couldn't determine the receiver from message history, fall back to the appointment lookup
        if (!inferredReceiverId) {
            // Verify user has access and get user roles
            const accessCheck = await verifyAppointmentAccess(appointment_id, currentUserId);

            if (!accessCheck.success || !accessCheck.appointment) {
                return {
                    success: false,
                    error: accessCheck.error || "You don't have permission to access this appointment",
                };
            }

            const appointment = accessCheck.appointment;

            // If current user is pet owner, receiver is vet
            if (accessCheck.isPetOwner) {
                if (!appointment.veterinarians?.users?.user_id) {
                    return {
                        success: false,
                        error: "Veterinarian not found for this appointment",
                    };
                }
                inferredReceiverId = appointment.veterinarians.users.user_id;
            }
            // If current user is vet, receiver is pet owner
            else if (accessCheck.isVet) {
                if (!appointment.pets?.users?.user_id) {
                    return {
                        success: false,
                        error: "Pet owner not found for this appointment",
                    };
                }
                inferredReceiverId = appointment.pets.users.user_id;
            }
        }

        if (!inferredReceiverId) {
            return {
                success: false,
                error: "Could not determine message recipient",
            };
        }
        console.log(currentUserId);

        const message = await prisma.messages.create({
            data: {
                appointment_id,
                receiver_id: inferredReceiverId,
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
const getMessages = async (
    appointment_id: number,
): Promise<ActionResponse<{ messages: Modify<messages, { message_id: string }>[] }>> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email || !session.user.role) redirect("/signin");

    try {
        const currentUserId = Number(session.user.id);

        // Verify user has access to this appointment
        const accessCheck = await verifyAppointmentAccess(appointment_id, currentUserId);

        if (!accessCheck.success) {
            return {
                success: false,
                error: accessCheck.error || "You don't have permission to access this appointment",
            };
        }

        // Get messages for this appointment
        const messages = await prisma.messages.findMany({
            where: {
                appointment_id,
                OR: [{ sender_id: currentUserId }, { receiver_id: currentUserId }],
            },
            orderBy: {
                created_at: "asc",
            },
        });
        // Mark unread messages as read
        await markMessagesAsRead(appointment_id, currentUserId);
        const formattedMessages = messages.map((m) => ({
            ...m,
            message_id: m.message_id.toString(), // Convert message_id to string
        }));

        return {
            success: true,
            data: { messages: formattedMessages },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { sendMessage, getMessages };
