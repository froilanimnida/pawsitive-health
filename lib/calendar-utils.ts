import { addDays, differenceInDays, setHours, setMinutes } from "date-fns";
import { TimeSlotType } from "@/schemas/prescription-definition";
import type { CalendarEventDetails } from "./google/calendar";
import type { prescription_schedule_type } from "@prisma/client";

interface MedicationEventOptions {
    medicationName: string;
    dosage: string;
    instructions: string;
    startDate: Date;
    endDate: Date;
    timeSlots: TimeSlotType[];
    scheduleType: prescription_schedule_type;
    petName: string;
    reminderMinutesBefore: number;
    customDescription?: string;
}

/**
 * Creates calendar events for medication schedules
 * This generates individual events for each dose within the prescription period
 */
export const createMedicationEvents = (options: MedicationEventOptions): CalendarEventDetails[] => {
    const {
        medicationName,
        dosage,
        instructions,
        startDate,
        endDate,
        timeSlots,
        scheduleType,
        petName,
        reminderMinutesBefore,
        customDescription,
    } = options;

    // The events to create
    const events: CalendarEventDetails[] = [];

    // Determine time between events based on schedule type
    let daysBetweenEvents = 1; // Default to daily
    switch (scheduleType) {
        case "every_other_day":
            daysBetweenEvents = 2;
            break;
        case "weekly":
            daysBetweenEvents = 7;
            break;
        case "as_needed":
            // No recurring events for as-needed medications
            return [];
        default:
            daysBetweenEvents = 1;
    }

    // Total days in the prescription
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // Base event description
    const description =
        customDescription || `${medicationName} ${dosage}\n${instructions}\n\nPrescribed for ${petName}`;

    // Generate events for each time slot on each day
    for (let day = 0; day < totalDays; day += daysBetweenEvents) {
        // Skip dates outside the range
        const currentDate = addDays(startDate, day);
        if (currentDate > endDate) break;

        // For each time slot, create an event
        for (const slot of timeSlots) {
            if (!slot.enabled) continue;

            // Set the event time
            const eventDate = setMinutes(setHours(currentDate, slot.hour), slot.minute);

            // End time is 15 minutes after start
            const endTime = new Date(eventDate);
            endTime.setMinutes(endTime.getMinutes() + 15);

            // Create the event
            events.push({
                summary: `${petName}: ${medicationName} ${dosage}`,
                description,
                location: "",
                startTime: eventDate,
                endTime,
                status: "confirmed",
                colorId: "9", // Orange color for medication
                reminders: {
                    useDefault: false,
                    overrides: [
                        {
                            method: "popup",
                            minutes: reminderMinutesBefore,
                        },
                    ],
                },
            });
        }
    }

    return events;
};
