"use client";
import { Button, Form } from "@/components/ui";
import { useAppointmentForm } from "./use-appointment-form";
import { SelectFields } from "./components/select-fields.";
import { TextFields } from "./components/text-fields";
import { DateSelector } from "./components/date-selector";
import { TimeSelector } from "./components/time-selector";
import { getAppointmentFields, getAppointmentSelectFields } from "./fields";
import type { clinics } from "@prisma/client";
import { Pets } from "@/types/pets";
import { AppointmentSummary } from "./components/appointment-summary";

export function AppointmentForm({
    params,
}: {
    params: {
        uuid: string;
        pets: Pets[];
        clinics: clinics[];
    };
}) {
    const {
        form,
        selectedDate,
        selectedClinicId,
        selectedVetId,
        veterinarians,
        isLoadingVets,
        timeSlots,
        isLoadingTimeSlots,
        onSubmit,
        handleClinicChange,
        handleDateSelect,
        handleVetChange,
    } = useAppointmentForm(params.uuid);

    const textFields = getAppointmentFields();
    const selectFields = getAppointmentSelectFields(params, {
        veterinarians,
        isLoadingVets,
        handleClinicChange,
        handleVetChange,
        form: form,
    });

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-8">
                <SelectFields
                    fields={selectFields}
                    control={form.control}
                    selectedClinicId={selectedClinicId}
                    isLoadingVets={isLoadingVets}
                />

                <TextFields fields={textFields} control={form.control} />

                <DateSelector control={form.control} onSelect={handleDateSelect} />

                <TimeSelector
                    control={form.control}
                    selectedDate={selectedDate}
                    selectedVetId={selectedVetId}
                    timeSlots={timeSlots}
                    isLoadingTimeSlots={isLoadingTimeSlots}
                />

                {selectedDate && form.watch("appointment_time") && (
                    <AppointmentSummary
                        selectedDate={selectedDate}
                        selectedTime={form.watch("appointment_time")}
                        selectedVetName={veterinarians.find((v) => v.value === selectedVetId)?.label}
                        selectedPetName={params.pets.find((p) => p.pet_uuid === form.watch("pet_uuid"))?.name}
                        selectedClinicName={params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.name}
                        selectedClinicAddress={`${params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.address}, ${
                            params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.city
                        }, ${params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.state} ${
                            params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.postal_code
                        }`}
                    />
                )}
                <Button type="submit">Add Appointment</Button>
            </form>
        </Form>
    );
}

export default AppointmentForm;
