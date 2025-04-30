import { AppointmentCard } from "@/components/shared/appointment-card";
import { notFound } from "next/navigation";
import { getAppointment, getMedicationsList } from "@/actions";
import { type Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { AppointmentHealthcareForms } from "@/components/form/appointment-healthcare-forms";
import AppointmentHistoricalData from "@/components/shared/appointment-historical-data";
import CurrentAppointmentRecordedService from "@/components/shared/veterinary/session-data";
import type { UUIDPageParams } from "@/types";
import { cache } from "react";

const getAppointmentCached = cache(async (uuid: string) => {
    const response = await getAppointment(uuid, true);
    if (!response.success || !response.data?.appointment) {
        return null;
    }
    return response.data.appointment;
});

export async function generateMetadata({ params }: UUIDPageParams): Promise<Metadata> {
    const { uuid } = await params;
    const appointment = await getAppointmentCached(uuid);
    return {
        title: appointment
            ? `${appointment.pets?.name} | ${appointment.clinics?.name} | PawsitiveHealth`
            : "Appointment Details | PawsitiveHealth",
        description: appointment ? `Details for ${appointment.pets?.name}` : "Appointment details page",
    };
}

const ViewAppointment = async ({ params }: UUIDPageParams) => {
    const { uuid } = await params;
    const appointmentResponse = await getAppointmentCached(uuid);
    if (!uuid || !appointmentResponse) notFound();
    const medicationResponse = await getMedicationsList();
    if (!appointmentResponse) notFound();
    const { status, appointment_uuid, pets, appointment_id } = appointmentResponse;

    return (
        <section className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <AppointmentCard appointment={appointmentResponse} viewerType="vet" />
            {(status === "checked_in" || status === "confirmed") && (
                <AppointmentHistoricalData
                    appointmentUuid={appointment_uuid}
                    petName={pets?.name ?? ""}
                    status={status}
                    key={status}
                />
            )}
            {status === "checked_in" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Record Services</CardTitle>
                        <CardDescription>
                            Document services provided during this appointment for {pets?.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pets && (
                            <AppointmentHealthcareForms
                                isVetView
                                medicationList={medicationResponse.success ? medicationResponse.data.medication : []}
                                petUuid={pets.pet_uuid}
                                petId={pets.pet_id}
                                appointmentId={appointment_id}
                                appointmentUuid={appointment_uuid}
                                petName={pets.name}
                            />
                        )}
                    </CardContent>
                </Card>
            )}
            <CurrentAppointmentRecordedService appointmentUuid={appointment_uuid} />
        </section>
    );
};

export default ViewAppointment;
