/**
 * Google Calendar API utilities
 */
import { refreshTokenIfNeeded } from "./auth";

interface GoogleTokenData {
    access_token: string;
    refresh_token?: string;
    expiry_date: number;
    token_type: string;
    scope: string;
}

interface CalendarEventDetails {
    summary: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    status: string;
    colorId?: string;
    reminders?: {
        useDefault?: boolean;
        overrides?: Array<{
            method: string;
            minutes: number;
        }>;
    };
}

/**
 * Google Calendar Event interface based on Google Calendar API v3
 */
interface GoogleCalendarEvent {
    kind: string;
    etag: string;
    id: string;
    status: string;
    htmlLink: string;
    created: string;
    updated: string;
    summary: string;
    description?: string;
    location?: string;
    colorId?: string;
    creator: {
        id?: string;
        email: string;
        displayName?: string;
        self?: boolean;
    };
    organizer: {
        id?: string;
        email: string;
        displayName?: string;
        self?: boolean;
    };
    start: {
        date?: string;
        dateTime?: string;
        timeZone?: string;
    };
    end: {
        date?: string;
        dateTime?: string;
        timeZone?: string;
    };
    recurringEventId?: string;
    originalStartTime?: {
        date?: string;
        dateTime?: string;
        timeZone?: string;
    };
    transparency?: string;
    visibility?: string;
    iCalUID: string;
    sequence: number;
    attendees?: Array<{
        id?: string;
        email?: string;
        displayName?: string;
        organizer?: boolean;
        self?: boolean;
        resource?: boolean;
        optional?: boolean;
        responseStatus?: string;
        comment?: string;
        additionalGuests?: number;
    }>;
    reminders?: {
        useDefault: boolean;
        overrides?: Array<{
            method: string;
            minutes: number;
        }>;
    };
    source?: {
        url?: string;
        title?: string;
    };
    attachments?: Array<{
        fileUrl?: string;
        title?: string;
        mimeType?: string;
        iconLink?: string;
        fileId?: string;
    }>;
}

/**
 * Creates a new event in the user's Google Calendar
 */
export async function createCalendarEvent(
    tokenData: GoogleTokenData,
    eventDetails: CalendarEventDetails,
): Promise<{ id: string } | null> {
    try {
        // Refresh token if needed
        const freshToken = await refreshTokenIfNeeded(tokenData);
        if (!freshToken) {
            throw new Error("Failed to refresh Google token");
        }

        // Make the API call to Google Calendar
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${freshToken.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                summary: eventDetails.summary,
                description: eventDetails.description,
                location: eventDetails.location,
                start: {
                    dateTime: eventDetails.startTime.toISOString(),
                    timeZone: "UTC",
                },
                end: {
                    dateTime: eventDetails.endTime.toISOString(),
                    timeZone: "UTC",
                },
                status: eventDetails.status,
                colorId: eventDetails.colorId,
                reminders: eventDetails.reminders || {
                    useDefault: true,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to create Google Calendar event:", errorData);
            return null;
        }

        // Get the event ID from the response
        const eventData = await response.json();
        return { id: eventData.id };
    } catch (error) {
        console.error("Error creating Google Calendar event:", error);
        return null;
    }
}

/**
 * Updates an existing event in the user's Google Calendar
 */
export async function updateCalendarEvent(
    tokenData: GoogleTokenData,
    eventId: string,
    eventDetails: CalendarEventDetails,
): Promise<boolean> {
    try {
        // Refresh token if needed
        const freshToken = await refreshTokenIfNeeded(tokenData);
        if (!freshToken) {
            throw new Error("Failed to refresh Google token");
        }

        // Make API call to update the Google Calendar event
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${freshToken.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                summary: eventDetails.summary,
                description: eventDetails.description,
                location: eventDetails.location,
                start: {
                    dateTime: eventDetails.startTime.toISOString(),
                    timeZone: "UTC",
                },
                end: {
                    dateTime: eventDetails.endTime.toISOString(),
                    timeZone: "UTC",
                },
                status: eventDetails.status,
                colorId: eventDetails.colorId,
                reminders: eventDetails.reminders,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to update Google Calendar event:", errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error updating Google Calendar event:", error);
        return false;
    }
}

/**
 * Deletes an event from the user's Google Calendar
 */
export async function deleteCalendarEvent(tokenData: GoogleTokenData, eventId: string): Promise<boolean> {
    try {
        // Refresh token if needed
        const freshToken = await refreshTokenIfNeeded(tokenData);
        if (!freshToken) {
            throw new Error("Failed to refresh Google token");
        }

        // Make API call to delete the Google Calendar event
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${freshToken.access_token}`,
            },
        });

        if (!response.ok && response.status !== 410) {
            // 410 Gone is acceptable (already deleted)
            const errorText = await response.text();
            console.error(`Failed to delete Google Calendar event: ${errorText}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
        return false;
    }
}

/**
 * Gets an event from the user's Google Calendar
 */
export async function getCalendarEvent(
    tokenData: GoogleTokenData,
    eventId: string,
): Promise<GoogleCalendarEvent | null> {
    try {
        // Refresh token if needed
        const freshToken = await refreshTokenIfNeeded(tokenData);
        if (!freshToken) {
            throw new Error("Failed to refresh Google token");
        }

        // Make API call to get the Google Calendar event
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${freshToken.access_token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to get Google Calendar event:", errorData);
            return null;
        }

        const eventData = (await response.json()) as GoogleCalendarEvent;
        return eventData;
    } catch (error) {
        console.error("Error getting Google Calendar event:", error);
        return null;
    }
}
