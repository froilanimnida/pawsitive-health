"use server";

import { prisma } from "@/lib";
import { auth } from "@/auth";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/google/calendar";
import { createCalendarEventDetails } from "@/lib/create-calendar-event-details";
import { AppointmentMetadata, createAppointmentMetadata } from "@/types/appointments-metadata";
import type { JsonObject } from "@prisma/client/runtime/library";

/**
 * Add an appointment to Google Calendar if the user has calendar sync enabled
 */
export async function addToGoogleCalendar(appointment_uuid: string): Promise<void> {
    try {
        const session = await auth();
        if (!session?.user?.email) return;

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
            data: {
                metadata: updatedMetadata as JsonObject,
            },
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
