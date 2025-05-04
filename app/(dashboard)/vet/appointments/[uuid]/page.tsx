import { AppointmentCard } from "@/components/shared/appointment-card";
import { notFound } from "next/navigation";
import {
    getAppointment,
    getMedicationsList,
    getPet,
    getPetHistoricalHealthcareData,
    getPetVaccinations,
} from "@/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { AppointmentHealthcareForms } from "@/components/form/appointment-healthcare-forms";
import AppointmentHistoricalData from "@/components/shared/appointment-historical-data";
import CurrentAppointmentRecordedService from "@/components/shared/veterinary/session-data";
import AppointmentChat from "@/components/shared/appointment-chat";
import type { UUIDPageParams } from "@/types";
import { cache } from "react";

const getAppointmentCached = cache(async (uuid: string) => {
    const response = await getAppointment(uuid);
    if (!response.success || !response.data?.appointment || !response.data.appointment.pet_id) {
        return null;
    }
    const petHistoricalDataResponse = await getPetHistoricalHealthcareData(response.data.appointment.pet_id);
    const getVaccinationsResponse = getPetVaccinations(response.data.appointment.pet_id);
    const petMedicalHistoryResponse = undefined;
    const petResponse = await getPet(response.data.appointment.pet_id);
    if (!petResponse.success || !petResponse.data.pet) {
        return null;
    }
    return {
        appointment: response.data.appointment,
        pets: petResponse.data.pet,
        petHistoricalData: petHistoricalDataResponse.success ? petHistoricalDataResponse.data : null,
    };
});

export const metadata = {
    title: "View Appointment | PawsitiveHealth",
    description: "View your pet's appointment details",
};

function AppointmentView({ appointmentData, medicationList }: any) {
    if (!appointmentData) return null;

    const { status, appointment_uuid, pets, appointment_id, veterinarians } = appointmentData;
    const petOwnerId = pets?.users?.user_id;
    const vetId = veterinarians?.user_id || veterinarians?.vet_id;

    return (
        <section className="space-y-6">
            <AppointmentCard appointment={appointmentData} viewerType="vet" />

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
                                medicationList={medicationList}
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

            {petOwnerId && vetId && (
                <AppointmentChat
                    appointmentId={appointment_id}
                    petOwnerId={petOwnerId}
                    vetId={vetId}
                    isVetView={true}
                />
            )}
        </section>
    );
}

// Server component for data fetching
const ViewAppointment = async ({ params }: UUIDPageParams) => {
    const { uuid } = await params;
    const appointmentResponse = await getAppointmentCached(uuid);
    if (!uuid || !appointmentResponse) notFound();
    const medicationResponse = await getMedicationsList();
    if (!appointmentResponse) notFound();

    return (
        <AppointmentView
            appointmentData={appointmentResponse}
            medicationList={medicationResponse.success ? medicationResponse.data.medication : []}
        />
    );
};

export default ViewAppointment;
