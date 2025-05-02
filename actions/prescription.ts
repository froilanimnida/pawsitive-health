"use server";
import { PrescriptionDefinition, type PrescriptionType } from "@/schemas";
import { prisma } from "@/lib";
import { ActionResponse } from "@/types";
import type { prescriptions } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPetId } from "@/actions";
import { createMedicationEvents } from "@/lib/calendar-utils";
import { createCalendarEvent } from "@/lib/google/calendar";

const addPrescription = async (values: PrescriptionType): Promise<ActionResponse | void> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        // Validate the prescription data first
        const formData = PrescriptionDefinition.safeParse(values);
        if (!formData.success) {
            return {
                success: false,
                error: "Invalid prescription data",
            };
        }

        // Get pet information if we're going to use the calendar
        let petName = "Pet";
        const addToCalendar = formData.data.add_to_calendar;

        // Get the pet details if we need them (for calendar or verification)
        if (formData.data.pet_uuid || addToCalendar) {
            const petUuid = formData.data.pet_uuid;
            let petResult;

            if (petUuid) {
                // If pet_uuid was provided, validate it
                petResult = await getPetId(petUuid);
                if (!petResult.success) {
                    return {
                        success: false,
                        error: "Invalid pet UUID",
                    };
                }
            } else {
                // Look up pet details directly using pet_id
                const pet = await prisma.pets.findUnique({
                    where: { pet_id: Number(formData.data.pet_id) },
                    select: { name: true, user_id: true },
                });

                if (!pet) {
                    return {
                        success: false,
                        error: "Pet not found",
                    };
                }

                petName = pet.name;
            }
        }

        // Get medication details for calendar events
        let medicationName = "Medication";
        if (addToCalendar) {
            const medication = await prisma.medications.findUnique({
                where: { medication_id: Number(formData.data.medication_id) },
                select: { name: true },
            });

            if (medication) {
                medicationName = medication.name;
            }
        }

        // Get vet ID if the session user is a veterinarian
        let veterinarian_id = null;
        if (session.user.role === "veterinarian") {
            const veterinarian = await prisma.veterinarians.findFirst({
                where: { user_id: Number(session.user.id) },
                select: { vet_id: true },
            });
            veterinarian_id = veterinarian?.vet_id;
        }

        // Create the prescription using Prisma transaction to ensure both prescription and time slots are saved together
        const result = await prisma.$transaction(async (tx) => {
            // Create the prescription record
            const prescription = await tx.prescriptions.create({
                data: {
                    dosage: formData.data.dosage,
                    frequency: formData.data.frequency,
                    start_date: formData.data.start_date,
                    pet_id: Number(formData.data.pet_id),
                    end_date: formData.data.end_date,
                    refills_remaining: formData.data.refills_remaining,
                    appointment_id: formData.data.appointment_id,
                    medication_id: formData.data.medication_id,
                    vet_id: veterinarian_id,
                    schedule_type: formData.data.schedule_type,
                    calendar_sync_enabled: formData.data.add_to_calendar,
                    reminder_minutes_before: formData.data.reminder_minutes_before,
                    custom_instructions: formData.data.custom_instructions,
                },
            });

            // Add the normalized time slots
            if (formData.data.time_slots && formData.data.time_slots.length > 0) {
                // Prepare batch data for time slots
                const timeSlotData = formData.data.time_slots.map((slot) => ({
                    prescription_id: prescription.prescription_id,
                    hour: slot.hour,
                    minute: slot.minute,
                    enabled: slot.enabled,
                }));

                // Create all time slots in the database
                await tx.prescription_time_slots.createMany({
                    data: timeSlotData,
                });
            }

            return prescription;
        });

        if (!result) {
            return {
                success: false,
                error: "Failed to add prescription",
            };
        }

        // Handle Google Calendar integration
        if (addToCalendar && formData.data.schedule_type && formData.data.time_slots) {
            try {
                // Get the pet owner (to access their calendar settings)
                const pet = await prisma.pets.findUnique({
                    where: { pet_id: Number(formData.data.pet_id) },
                    select: { user_id: true },
                });

                if (pet?.user_id) {
                    // Get user's Google Calendar token
                    const userSettings = await prisma.user_settings.findUnique({
                        where: { user_id: pet.user_id },
                        select: { google_calendar_token: true, google_calendar_sync: true },
                    });

                    // Only proceed if user has Google Calendar integration enabled
                    if (userSettings?.google_calendar_sync && userSettings.google_calendar_token) {
                        const tokenData = JSON.parse(userSettings.google_calendar_token);

                        // Generate calendar events based on the schedule
                        const reminderMinutes = formData.data.reminder_minutes_before ?? 15;
                        const medicationEvents = createMedicationEvents({
                            medicationName,
                            dosage: formData.data.dosage,
                            instructions: formData.data.frequency,
                            startDate: formData.data.start_date,
                            endDate: formData.data.end_date,
                            timeSlots: formData.data.time_slots,
                            scheduleType: formData.data.schedule_type,
                            petName,
                            reminderMinutesBefore: reminderMinutes,
                            customDescription: formData.data.custom_schedule_description,
                        });

                        // Create all events in Google Calendar
                        const createdEventIds = [];
                        for (const event of medicationEvents) {
                            const calEvent = await createCalendarEvent(tokenData, event);
                            if (calEvent?.id) {
                                createdEventIds.push(calEvent.id);
                            }
                        }

                        // Store the calendar event IDs in the prescription record
                        if (createdEventIds.length > 0) {
                            await prisma.prescriptions.update({
                                where: { prescription_id: result.prescription_id },
                                data: {
                                    calendar_event_ids: createdEventIds,
                                    last_calendar_sync: new Date(),
                                },
                            });
                        }

                        // Log the number of events created
                        console.log(`Created ${createdEventIds.length} medication reminders in Google Calendar`);
                    }
                }
            } catch (calendarError) {
                // Don't fail the prescription creation if calendar integration fails
                console.error("Failed to add calendar events:", calendarError);
            }
        }

        revalidatePath(`/vet`);
    } catch (error) {
        console.error("Error adding prescription:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

/**
 * Get a prescription by UUID
 */
const viewPrescription = async (
    prescription_uuid: string,
): Promise<ActionResponse<{ prescription: prescriptions }>> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        // Get prescription with time slots
        const prescription = await prisma.prescriptions.findUnique({
            where: {
                prescription_uuid: prescription_uuid,
            },
            include: {
                time_slot_details: true,
            },
        });

        if (!prescription) {
            return {
                success: false,
                error: "Prescription not found",
            };
        }

        return {
            success: true,
            data: { prescription },
        };
    } catch (error) {
        console.error("Failed to view prescription:", error);
        return {
            success: false,
            error: "Failed to fetch prescription",
        };
    }
};

/**
 * Delete a prescription by ID
 */
const deletePrescription = async (prescription_id: number, apppointment_uuid: string) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        // Delete prescription (time slots will be automatically deleted due to CASCADE relationship)
        const result = await prisma.prescriptions.delete({
            where: {
                prescription_id: prescription_id,
            },
        });

        if (!result) {
            return {
                success: false,
                error: "Failed to delete prescription",
            };
        }

        revalidatePath(`/vet/appointments/${apppointment_uuid}`);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { addPrescription, viewPrescription, deletePrescription };
