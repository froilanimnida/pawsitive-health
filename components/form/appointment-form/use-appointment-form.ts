import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointment_type, type vet_availability } from "@prisma/client";
import { AppointmentSchema, AppointmentType } from "@/schemas";
import { addMinutes, format } from "date-fns";
import {
    getVeterinarians,
    getVeterinaryAvailability,
    createUserAppointment,
    getExistingAppointments,
    getUser,
} from "@/actions";
import { createFormConfig, toTitleCase } from "@/lib";
import { toast } from "sonner";

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
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
    const appointmentForm = useForm<AppointmentType>(
        createFormConfig({
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
        }),
    );
    const {
        formState: { isLoading, isSubmitting },
        setValue,
        handleSubmit,
        control,
        watch,
    } = appointmentForm;

    useEffect(() => {
        const loadVeterinarians = async () => {
            if (!selectedClinicId) {
                setVeterinarians([]);
                return;
            }
            setIsLoadingVets(true);
            try {
                const data = await getVeterinarians(Number(selectedClinicId));
                const vets = data.success ? data.data.veterinarians : [];

                const vetPromises = vets.map(async (vet) => {
                    const userData = await getUser(vet.user_id as number);
                    const user = userData.success ? userData.data.user : null;

                    const vetName = user ? `${user.first_name} ${user.last_name}` : "Unknown";

                    return {
                        label: `${vetName} (${toTitleCase(vet.specialization)})`,
                        value: vet.vet_id.toString(),
                    };
                });

                // Wait for all promises to resolve before updating state
                const resolvedVets = await Promise.all(vetPromises);
                setVeterinarians(resolvedVets);
            } catch {
                setVeterinarians([]);
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

                // Find the availability record for the selected day, vet, and clinic
                const dayAvailability = availability.find(
                    (a) =>
                        a.day_of_week === dayOfWeek &&
                        a.vet_id === Number(selectedVetId) &&
                        a.clinic_id === Number(selectedClinicId),
                );

                // If no availability record is found or is_available is explicitly false, return empty slots
                if (!dayAvailability || dayAvailability.is_available === false) {
                    setTimeSlots([]);
                    return;
                }

                const existingData = await getExistingAppointments(selectedDate, Number(selectedVetId));
                const appointments = existingData.success ? existingData.data.appointments : [];

                const slots: TimeSlot[] = [];

                // Fix: Properly handle UTC time conversion for time slots
                const startTime = new Date(dayAvailability.start_time);
                const endTime = new Date(dayAvailability.end_time);

                // Create a new Date using the selected date, but with hours/minutes from availability
                let currentSlot = new Date(selectedDate);
                currentSlot.setHours(startTime.getUTCHours(), startTime.getUTCMinutes(), 0, 0);

                const slotEndTime = new Date(selectedDate);
                slotEndTime.setHours(endTime.getUTCHours(), endTime.getUTCMinutes(), 0, 0);

                // Only generate slots if the end time is after the start time
                if (slotEndTime > currentSlot) {
                    while (currentSlot < slotEndTime) {
                        const slotStartTime = new Date(currentSlot);
                        const slotEndTime = addMinutes(currentSlot, 30);

                        const matchingAppointments = appointments.filter((appointment) => {
                            const appointmentTime = new Date(appointment.appointment_date);
                            const appointmentEndTime = addMinutes(appointmentTime, appointment.duration_minutes || 30);
                            const hasOverlap =
                                (slotStartTime >= appointmentTime && slotStartTime < appointmentEndTime) ||
                                (slotEndTime > appointmentTime && slotEndTime <= appointmentEndTime) ||
                                (slotStartTime <= appointmentTime && slotEndTime >= appointmentEndTime);

                            return hasOverlap;
                        });

                        let statusMessage = null;
                        if (matchingAppointments.length > 0) {
                            statusMessage = `Booked: ${matchingAppointments[0].status}`;
                        }

                        slots.push({
                            time: format(currentSlot, "h:mm a"),
                            available: matchingAppointments.length === 0,
                            statusMessage: statusMessage,
                            appointmentId:
                                matchingAppointments.length > 0 ? matchingAppointments[0].appointment_uuid : null,
                        });

                        currentSlot = addMinutes(currentSlot, 30);
                    }
                } else {
                    console.log("Invalid time range: end time is not after start time");
                }

                setTimeSlots(slots);
            } catch (error) {
                console.error("Error loading time slots:", error);
                setTimeSlots([]);
            } finally {
                setIsLoadingTimeSlots(false);
            }
        };

        loadTimeSlots();
    }, [selectedDate, selectedVetId, selectedClinicId]);

    const onSubmit = async (values: AppointmentType) => {
        try {
            if (!selectedDate) {
                toast.error("Please select a date");
                return;
            }
            const submissionData = { ...values };

            if (selectedDate && values.appointment_time) {
                const timeString = values.appointment_time;
                const [hourMinute, period] = timeString.split(" ");
                const [hourStr, minuteStr] = hourMinute.split(":");

                let hour = parseInt(hourStr);
                const minute = parseInt(minuteStr);

                if (period === "PM" && hour < 12) hour += 12;
                else if (period === "AM" && hour === 12) hour = 0;

                const appointmentDate = new Date(selectedDate);
                appointmentDate.setHours(hour, minute, 0, 0);

                submissionData.appointment_date = appointmentDate;
            } else return;
            const result = await createUserAppointment(submissionData);
            if (result === undefined) {
                toast.success("Appointment created successfully");
                return;
            }
            toast.error((result && !result.success && result.error) || "Failed to create appointment");
        } catch {
            toast.error("An unexpected error occurred");
        }
    };

    const handleClinicChange = (value: string) => {
        setValue("clinic_id", value);
        setValue("vet_id", "");
        setSelectedClinicId(value);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setValue("appointment_time", "");
    };

    const handleVetChange = (value: string) => {
        setValue("vet_id", value);
        setSelectedVetId(value);
    };

    return {
        appointmentForm,
        selectedDate,
        selectedClinicId,
        selectedVetId,
        veterinarians,
        isLoadingVets,
        timeSlots,
        isLoadingTimeSlots,
        onSubmit: handleSubmit(onSubmit),
        handleClinicChange,
        handleDateSelect,
        handleVetChange,
        setSelectedVetId,
        vetAvailability,
        isLoading,
        isSubmitting,
        control,
        watch,
    };
}
