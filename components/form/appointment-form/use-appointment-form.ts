import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { appointment_type, type vet_availability } from "@prisma/client";
import { AppointmentSchema } from "@/schemas/appointment-definition";
import { addMinutes, format } from "date-fns";
import { getVeterinariansByClinic } from "@/actions/veterinary";
import { getVeterinaryAvailability } from "@/actions/veterinarian-availability";
import { createUserAppointment, getExistingAppointments } from "@/actions/appointment";
import { toTitleCase } from "@/lib/functions/text/title-case";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export interface TimeSlot {
    time: string;
    available: boolean;
    statusMessage?: string | null;
    appointmentId?: string | null;
}

export function useAppointmentForm(uuid: string) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedClinicId, setSelectedClinicId] = useState<string>("");
    const [selectedVetId, setSelectedVetId] = useState<string>("");
    const [veterinarians, setVeterinarians] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingVets, setIsLoadingVets] = useState<boolean>(false);
    const [vetAvailability, setVetAvailability] = useState<vet_availability[]>([]);
    const [existingAppointments, setExistingAppointments] = useState<Date[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

    const form = useForm({
        defaultValues: {
            notes: "",
            appointment_type: appointment_type.behavioral_consultation,
            vet_id: "",
            pet_uuid: uuid,
            clinic_id: "",
            appointment_date: undefined,
            duration_minutes: 0,
        },
        resolver: zodResolver(AppointmentSchema),
        progressive: true,
        shouldFocusError: true,
    });

    useEffect(() => {
        const loadVeterinarians = async () => {
            if (!selectedClinicId) {
                setVeterinarians([]);
                return;
            }

            setIsLoadingVets(true);
            try {
                const data = await getVeterinariansByClinic(selectedClinicId);
                const vets = data.success ? data.data.veterinarians : [];
                setVeterinarians(
                    vets.map((vet) => ({
                        label: `${vet.name} (${toTitleCase(vet.specialization)})`,
                        value: vet.id,
                    })),
                );
            } catch (error) {
                console.error("Failed to load veterinarians:", error);
            } finally {
                setIsLoadingVets(false);
            }
        };
        loadVeterinarians();
    }, [selectedClinicId]);
    useEffect(() => {
        const loadTimeSlots = async () => {
            if (!selectedDate || !selectedVetId || !selectedClinicId) {
                setTimeSlots([]);
                return;
            }

            setIsLoadingTimeSlots(true);
            try {
                const dayOfWeek = selectedDate.getDay();

                const data = await getVeterinaryAvailability(Number(selectedVetId));
                const availability = data.success ? data.data.availability : [];
                setVetAvailability(availability);

                const dayAvailability = availability.find((a) => {
                    const matches =
                        a.day_of_week === dayOfWeek &&
                        a.vet_id === Number(selectedVetId) &&
                        a.clinic_id === Number(selectedClinicId) &&
                        a.is_available;
                    return matches;
                });

                console.log("Found availability for selected day:", dayAvailability);

                if (!dayAvailability) {
                    setTimeSlots([]);
                    return;
                }

                // Get existing appointments
                const existingData = await getExistingAppointments(selectedDate, Number(selectedVetId));
                const appointments = existingData.success ? existingData.data.appointments : [];
                console.log("Existing appointments:", appointments);

                // Generate time slots
                const slots: TimeSlot[] = [];

                // Create Date objects for start and end times
                const startTime = new Date(dayAvailability.start_time);
                const endTime = new Date(dayAvailability.end_time);

                console.log("Working hours:", {
                    start: startTime.toLocaleTimeString(),
                    end: endTime.toLocaleTimeString(),
                });

                let currentSlot = new Date(selectedDate);
                currentSlot.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

                const slotEndTime = new Date(selectedDate);
                slotEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

                while (currentSlot < slotEndTime) {
                    const slotStartTime = new Date(currentSlot);
                    const slotEndTime = addMinutes(currentSlot, 30);

                    const matchingAppointments = appointments.filter((appointment) => {
                        const appointmentTime = new Date(appointment.appointment_date);
                        const appointmentEndTime = addMinutes(appointmentTime, appointment.duration_minutes || 30);

                        // Check for any overlap
                        const hasOverlap =
                            // Slot starts during an existing appointment
                            (slotStartTime >= appointmentTime && slotStartTime < appointmentEndTime) ||
                            // Slot ends during an existing appointment
                            (slotEndTime > appointmentTime && slotEndTime <= appointmentEndTime) ||
                            // Slot completely contains an existing appointment
                            (slotStartTime <= appointmentTime && slotEndTime >= appointmentEndTime);

                        return hasOverlap;
                    });

                    // Format status message if there are appointments
                    let statusMessage = null;
                    if (matchingAppointments.length > 0) {
                        statusMessage = `Booked: ${matchingAppointments[0].status}`;
                    }

                    // Add slot to our list with availability info
                    slots.push({
                        time: format(currentSlot, "h:mm a"),
                        available: matchingAppointments.length === 0,
                        statusMessage: statusMessage,
                        appointmentId:
                            matchingAppointments.length > 0 ? matchingAppointments[0].appointment_uuid : null,
                    });

                    // Move to next 30-min slot
                    currentSlot = addMinutes(currentSlot, 30);
                }

                console.log("Generated time slots:", slots);
                setTimeSlots(slots);
            } catch (error) {
                console.error("Failed to load time slots:", error);
                setTimeSlots([]);
            } finally {
                setIsLoadingTimeSlots(false);
            }
        };

        loadTimeSlots();
    }, [selectedDate, selectedVetId, selectedClinicId]);

    const onSubmit = async (values: z.infer<typeof AppointmentSchema>) => {
        try {
            // Create a copy of the values to avoid modifying the original
            const submissionData = { ...values };

            // Check if we have both date and time
            if (selectedDate && values.appointment_time) {
                // Parse the time from the 12-hour format string
                const timeString = values.appointment_time; // e.g. "5:00 PM"
                const [hourMinute, period] = timeString.split(" ");
                const [hourStr, minuteStr] = hourMinute.split(":");

                let hour = parseInt(hourStr);
                const minute = parseInt(minuteStr);

                if (period === "PM" && hour < 12) hour += 12;
                else if (period === "AM" && hour === 12) hour = 0;

                const appointmentDate = new Date(selectedDate);
                appointmentDate.setHours(hour, minute, 0, 0);

                submissionData.appointment_date = appointmentDate;

                console.log("Submission data with combined date/time:", submissionData);
            } else {
                console.error("Missing date or time for appointment");
                return; // Prevent submission
            }
            await createUserAppointment(submissionData);
        } catch (error) {
            console.error("Error submitting appointment:", error);
            toast.error("An unexpected error occurred");
        }
    };

    const handleClinicChange = (value: string) => {
        form.setValue("clinic_id", value);
        form.setValue("vet_id", "");
        setSelectedClinicId(value);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        form.setValue("appointment_time", "");
    };

    const handleVetChange = (value: string) => {
        form.setValue("vet_id", value);
        setSelectedVetId(value);
    };

    return {
        form,
        selectedDate,
        selectedClinicId,
        selectedVetId,
        veterinarians,
        isLoadingVets,
        timeSlots,
        isLoadingTimeSlots,
        onSubmit: form.handleSubmit(onSubmit),
        handleClinicChange,
        handleDateSelect,
        handleVetChange,
        setSelectedVetId,
    };
}
