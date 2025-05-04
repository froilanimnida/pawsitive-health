import { notFound } from "next/navigation";
import { getAppointment, getClinic, getPet, getUser, getVeterinarian } from "@/actions";
import { Metadata } from "next";
import { AppointmentCard } from "@/components/shared/appointment-card";
import AppointmentChat from "@/components/shared/appointment-chat";
import { cache } from "react";

export const metadata: Metadata = {
    title: "View Appointment | PawsitiveHealth",
    description: "View your pet's appointment details",
};

const getAppointmentCached = cache(async (uuid: string) => {
    const response = await getAppointment(uuid);
    if (
        !response.success ||
        !response.data?.appointment ||
        !response.data.appointment.clinic_id ||
        !response.data.appointment.pet_id ||
        !response.data.appointment.vet_id
    ) {
        return null;
    }
    const clinicResponse = await getClinic(response.data.appointment.clinic_id);
    const veterinarianResponse = await getVeterinarian(response.data.appointment.vet_id);
    const petResponse = await getPet(response.data.appointment.pet_id);
    const vetInfoResponse = await getUser(response.data.appointment.vet_id);
    if (
        !clinicResponse.success ||
        !petResponse.success ||
        !clinicResponse.data.clinic ||
        !veterinarianResponse.success ||
        !vetInfoResponse.success
    ) {
        return null;
    }
    return {
        appointment: response.data.appointment,
        clinics: clinicResponse.data.clinic,
        pets: petResponse.data.pet,
        veterinarians: veterinarianResponse.data.veterinarian,
        vetInfo: vetInfoResponse.data.user,
    };
});
async function ViewAppointment({ params }: { params: Promise<{ appointment_uuid: string }> }) {
    const { appointment_uuid } = await params;
    const response = await getAppointmentCached(appointment_uuid);

    if (!response) notFound();

    const petOwnerId = response.appointment.pet_id;
    const vetId = response.veterinarians?.user_id || response.veterinarians.vet_id;

    return (
        <div className="container max-w-4xl py-6">
            <AppointmentCard
                clinic={response.clinics}
                vetInfo={response.vetInfo}
                appointment={response.appointment}
                pet={response.pets}
                viewerType="user"
                veterinarian={response.veterinarians}
                vetId={response.veterinarians.vet_id}
            />
            {petOwnerId && vetId && (
                <AppointmentChat
                    appointmentId={response.appointment.appointment_id}
                    petOwnerId={petOwnerId}
                    vetId={vetId}
                    isVetView={false}
                />
            )}
        </div>
    );
}

export default ViewAppointment;
