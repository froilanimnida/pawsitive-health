"use server";

import { prisma } from "@/lib";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/google/calendar";
import { createCalendarEventDetails } from "@/lib/create-calendar-event-details";
import { AppointmentMetadata, createAppointmentMetadata } from "@/types/appointments-metadata";
import type { JsonObject } from "@prisma/client/runtime/library";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

/**
 * Add an appointment to Google Calendar if the user has calendar sync enabled
 */
export async function addToGoogleCalendar(appointment_uuid: string): Promise<void> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Get the appointment details
        const appointment = await prisma.appointments.findUnique({
            where: { appointment_uuid },
            include: {
                pets: {
                    include: {
                        users: true,
                    },
                },
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
                clinics: true,
            },
        });

        if (!appointment || !appointment.pets?.users) return;

        // Check if the user has calendar sync enabled
        const userId = appointment.pets.users.user_id;
        const userSettings = await prisma.user_settings.findUnique({
            where: { user_id: userId },
        });

        // Only proceed if the user has enabled Google Calendar sync
        if (!userSettings?.google_calendar_sync || !userSettings?.google_calendar_token) {
            return;
        }

        // Parse the stored token
        const tokenData = JSON.parse(userSettings.google_calendar_token);

        // Create event details using our utility
        const eventDetails = createCalendarEventDetails(appointment);

        // Create the event in Google Calendar using our new utility
        const result = await createCalendarEvent(tokenData, eventDetails);

        if (!result) {
            console.error("Failed to create Google Calendar event");
            return;
        }

        const googleCalendarEventId = result.id; // Store the returned event ID in a properly named variable

        // Create safe metadata object using our helper function
        const updatedMetadata = createAppointmentMetadata(
            appointment.metadata,
            { googleCalendarEventId }, // Now using the correctly named variable
        );

        // Save the Google Calendar event ID in our database
        await prisma.appointments.update({
            where: { appointment_uuid },
            data: { metadata: updatedMetadata as JsonObject },
        });

        console.log(`Added appointment to Google Calendar: ${googleCalendarEventId}`);
        // If the token was refreshed, it will have been handled in createCalendarEvent
    } catch (error) {
        console.error("Error adding to Google Calendar:", error);
    }
}

/**
 * Update an existing Google Calendar event when an appointment is modified
 */
export async function updateGoogleCalendarEvent(appointment_uuid: string): Promise<void> {
    try {
        // Get the appointment with its metadata
        const appointment = await prisma.appointments.findUnique({
            where: { appointment_uuid },
            include: {
                pets: {
                    include: {
                        users: true,
                    },
                },
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
                clinics: true,
            },
        });

        if (!appointment || !appointment.pets?.users) return;

        // Check if this appointment has a Google Calendar event ID
        const metadata = appointment.metadata as AppointmentMetadata | null;
        const googleEventId = metadata?.googleCalendarEventId;

        if (!googleEventId) {
            return addToGoogleCalendar(appointment_uuid);
        }

        // Check if the user still has calendar sync enabled
        const userId = appointment.pets.users.user_id;
        const userSettings = await prisma.user_settings.findUnique({
            where: { user_id: userId },
        });

        if (!userSettings?.google_calendar_sync || !userSettings?.google_calendar_token) {
            return;
        }

        // Parse the stored token
        const tokenData = JSON.parse(userSettings.google_calendar_token);

        // Create updated event details
        const eventDetails = createCalendarEventDetails(appointment);

        // Update the event using our new utility
        const success = await updateCalendarEvent(tokenData, googleEventId, eventDetails);

        if (!success) {
            console.error("Failed to update Google Calendar event");
            return;
        }

        console.log(`Updated Google Calendar event: ${googleEventId}`);
    } catch (error) {
        console.error("Error updating Google Calendar event:", error);
    }
}

/**
 * Delete a Google Calendar event when an appointment is cancelled
 */
export async function deleteGoogleCalendarEvent(appointment_uuid: string): Promise<void> {
    try {
        // Get the appointment with its metadata
        const appointment = await prisma.appointments.findUnique({
            where: { appointment_uuid },
            include: {
                pets: {
                    include: {
                        users: true,
                    },
                },
            },
        });

        if (!appointment || !appointment.pets?.users) return;

        // Check if this appointment has a Google Calendar event ID
        const metadata = appointment.metadata as AppointmentMetadata | null;
        const googleEventId = metadata?.googleCalendarEventId;

        if (!googleEventId) return;

        // Check if the user still has calendar sync enabled
        const userId = appointment.pets.users.user_id;
        const userSettings = await prisma.user_settings.findUnique({
            where: { user_id: userId },
        });

        if (!userSettings?.google_calendar_sync || !userSettings?.google_calendar_token) {
            return;
        }

        // Parse the stored token
        const tokenData = JSON.parse(userSettings.google_calendar_token);

        // Delete the event using our new utility
        const success = await deleteCalendarEvent(tokenData, googleEventId);

        if (!success) {
            console.error("Failed to delete Google Calendar event");
            return;
        }

        console.log(`Deleted Google Calendar event: ${googleEventId}`);

        // Create updated metadata without the Google Calendar event ID
        const updatedMetadata = createAppointmentMetadata(appointment.metadata, { googleCalendarEventId: null });

        // Update the appointment metadata
        await prisma.appointments.update({
            where: { appointment_uuid },
            data: {
                metadata: updatedMetadata as JsonObject,
            },
        });
    } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
    }
}

/**
 * Synchronize all upcoming appointments for the current user to Google Calendar
 * This will respect existing entries and avoid duplicates
 */
export async function synchronizeAllAppointments(): Promise<{
    success: boolean;
    synced: number;
    skipped: number;
    error?: string;
}> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Get the user ID
        const userResult = await prisma.users.findUnique({
            where: { user_id: Number(session.user.id) },
        });

        if (!userResult) redirect("/signin");

        const userId = userResult.user_id;

        // Check if user has Google Calendar integration enabled
        const userSettings = await prisma.user_settings.findUnique({
            where: { user_id: userId },
        });

        if (!userSettings?.google_calendar_sync || !userSettings?.google_calendar_token) {
            return {
                success: false,
                synced: 0,
                skipped: 0,
                error: "Google Calendar integration not enabled",
            };
        }

        const tokenData = JSON.parse(userSettings.google_calendar_token);

        // Get all of the user's pets
        const pets = await prisma.pets.findMany({
            where: {
                user_id: userId,
                deleted: false,
            },
            select: { pet_id: true },
        });

        if (pets.length === 0) {
            return {
                success: true,
                synced: 0,
                skipped: 0,
            };
        }

        const petIds = pets.map((pet) => pet.pet_id);

        // Get all upcoming appointments for all pets
        const appointments = await prisma.appointments.findMany({
            where: {
                pet_id: { in: petIds },
                appointment_date: {
                    gte: new Date(), // Only future appointments
                },
                status: {
                    notIn: ["cancelled", "no_show"],
                },
            },
            include: {
                pets: {
                    include: {
                        users: true,
                    },
                },
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
                clinics: true,
            },
            orderBy: {
                appointment_date: "asc",
            },
        });

        if (appointments.length === 0) {
            // Update the last sync time even if there are no appointments
            await prisma.user_settings.update({
                where: { user_id: userId },
                data: { last_sync: new Date() },
            });

            return {
                success: true,
                synced: 0,
                skipped: 0,
            };
        }

        // Track sync stats
        let synced = 0;
        let skipped = 0;

        // Process each appointment
        for (const appointment of appointments) {
            // Check if the appointment already has a Google Calendar event ID
            const metadata = appointment.metadata as AppointmentMetadata | null;
            const googleEventId = metadata?.googleCalendarEventId;

            // If it already has a Google Calendar ID, we'll update it
            if (googleEventId) {
                // Create updated event details
                const eventDetails = createCalendarEventDetails(appointment);

                // Update the event using our utility
                const success = await updateCalendarEvent(tokenData, googleEventId, eventDetails);

                if (success) {
                    skipped++;
                } else {
                    // If the update fails (possibly because the event was deleted in Google Calendar)
                    // We'll try to create a new one
                    const result = await createCalendarEvent(tokenData, eventDetails);

                    if (result) {
                        // Save the new Google Calendar event ID
                        const updatedMetadata = createAppointmentMetadata(appointment.metadata, {
                            googleCalendarEventId: result.id,
                        });

                        await prisma.appointments.update({
                            where: { appointment_uuid: appointment.appointment_uuid },
                            data: { metadata: updatedMetadata as JsonObject },
                        });

                        synced++;
                    }
                }
            } else {
                // If it doesn't have a Google Calendar ID, create a new event
                const eventDetails = createCalendarEventDetails(appointment);
                const result = await createCalendarEvent(tokenData, eventDetails);

                if (result) {
                    // Save the Google Calendar event ID
                    const updatedMetadata = createAppointmentMetadata(appointment.metadata, {
                        googleCalendarEventId: result.id,
                    });

                    await prisma.appointments.update({
                        where: { appointment_uuid: appointment.appointment_uuid },
                        data: { metadata: updatedMetadata as JsonObject },
                    });

                    synced++;
                }
            }
        }

        // Update the last sync time
        await prisma.user_settings.update({
            where: { user_id: userId },
            data: { last_sync: new Date() },
        });

        return {
            success: true,
            synced,
            skipped,
        };
    } catch (error) {
        console.error("Error synchronizing appointments to Google Calendar:", error);
        return {
            success: false,
            synced: 0,
            skipped: 0,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
