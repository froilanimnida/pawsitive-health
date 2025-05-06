"use client";
import { Button, Form } from "@/components/ui";
import { useAppointmentForm } from "./use-appointment-form";
import { SelectFields } from "./components/select-fields.";
import { TextFields } from "./components/text-fields";
import { DateSelector } from "./components/date-selector";
import { TimeSelector } from "./components/time-selector";
import { getAppointmentFields, getAppointmentSelectFields } from "./fields";
import type { clinics, pets } from "@prisma/client";
import { AppointmentSummary } from "./components/appointment-summary";
import type { Modify } from "@/types";

export function AppointmentForm({
    params,
}: {
    params: {
        uuid: string;
        pets: Modify<pets, { weight_kg: string }>[];
        clinics: clinics[];
    };
}) {
    const {
        appointmentForm,
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
        isLoading,
        isSubmitting,
        control,
        watch,
    } = useAppointmentForm(params.uuid);

    const textFields = getAppointmentFields();
    const selectFields = getAppointmentSelectFields(params, {
        veterinarians,
        isLoadingVets,
        handleClinicChange,
        handleVetChange,
        form: appointmentForm,
    });

    return (
        <Form {...appointmentForm}>
            <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectFields
                        fields={selectFields}
                        control={control}
                        selectedClinicId={selectedClinicId}
                        isLoadingVets={isLoadingVets}
                    />
                    <TextFields fields={textFields} control={control} />
                    <DateSelector control={control} onSelect={handleDateSelect} />
                    <TimeSelector
                        control={control}
                        selectedDate={selectedDate}
                        selectedVetId={selectedVetId}
                        timeSlots={timeSlots}
                        isLoadingTimeSlots={isLoadingTimeSlots}
                    />

                    {selectedDate && watch("appointment_time") && (
                        <AppointmentSummary
                            selectedDate={selectedDate}
                            selectedTime={watch("appointment_time")}
                            selectedVetName={veterinarians.find((v) => v.value === selectedVetId)?.label}
                            selectedPetName={params.pets.find((p) => p.pet_uuid === watch("pet_uuid"))?.name}
                            selectedClinicName={
                                params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.name
                            }
                            selectedClinicAddress={`${params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.address}, ${
                                params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.city
                            }, ${params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.state} ${
                                params.clinics.find((c) => String(c.clinic_id) === selectedClinicId)?.postal_code
                            }`}
                        />
                    )}
                </div>
                <Button disabled={isSubmitting || isLoading} type="submit">
                    Add Appointment
                </Button>
            </form>
        </Form>
    );
}

export default AppointmentForm;
