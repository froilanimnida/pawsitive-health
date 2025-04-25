/**
 * Utilities for creating Google Calendar event details from appointment data
 */
import { addMinutes } from "date-fns";
import { AppointmentWithRelations } from "@/actions/appointment";
import { toTitleCase } from "./functions/text/title-case";

/**
 * Create the event details for a Google Calendar event from an appointment
 */
export function createCalendarEventDetails(appointment: AppointmentWithRelations) {
    const vetName = appointment.veterinarians?.users
        ? `${appointment.veterinarians.users.first_name} ${appointment.veterinarians.users.last_name}`
        : "Unknown Veterinarian";

    const endTime = addMinutes(appointment.appointment_date, appointment.duration_minutes || 30);

    const location = appointment.clinics
        ? `${appointment.clinics.name}, ${appointment.clinics.address}, ${appointment.clinics.city}, ${appointment.clinics.state} ${appointment.clinics.postal_code}`
        : "";

    // Create a specific color based on appointment type
    // Google Calendar color IDs: 1=blue, 2=green, 3=purple, 4=red, 5=yellow, 6=orange, 7=turquoise, etc.
    let colorId = "1"; // Default blue
    if (appointment.appointment_type === "emergency") {
        colorId = "4"; // Red for emergencies
    } else if (appointment.appointment_type === "surgery" || appointment.appointment_type === "spay_neuter") {
        colorId = "3"; // Purple for surgeries
    } else if (appointment.appointment_type === "wellness_exam" || appointment.appointment_type === "vaccination") {
        colorId = "2"; // Green for routine/preventive care
    }

    const summary = `Vet Appointment for ${appointment.pets ? appointment.pets.name : "Unknown Pet"}`;
    const description = `
Veterinarian: Dr. ${vetName}
Type: ${toTitleCase(appointment.appointment_type)}
Pet Name: ${appointment.pets ? appointment.pets.name : "Unknown Pet"}
Status: ${toTitleCase(appointment.status)}
${appointment.notes ? `Notes: ${appointment.notes}` : ""}
${appointment.clinics?.phone_number ? `Phone: ${appointment.clinics.phone_number}` : ""}
    `.trim();

    return {
        summary,
        description,
        location,
        startTime: appointment.appointment_date,
        endTime,
        status: toTitleCase(appointment.status === "cancelled" ? "cancelled" : "confirmed"),
        colorId,
        reminders: {
            useDefault: false,
            overrides: [
                { method: "email", minutes: 24 * 60 }, // 1 day before
                { method: "popup", minutes: 60 }, // 1 hour before
            ],
        },
    };
}
