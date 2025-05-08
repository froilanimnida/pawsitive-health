import { getAppointment, getClinic, getPet, getUser, getVeterinarian } from "@/actions";
import { AppointmentCard } from "@/components/shared/appointment-card";
import { role_type } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

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
    console.log(response.data.appointment.vet_id);
    if (
        !clinicResponse.success ||
        !petResponse.success ||
        !clinicResponse.data.clinic ||
        !veterinarianResponse.success
    ) {
        return null;
    }
    const vetInfoResponse = await getUser(veterinarianResponse.data.veterinarian.user_id as number);
    if (!vetInfoResponse.success) {
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

const AppointmentDetails = async ({ params }: { params: Promise<{ uuid: string }> }) => {
    const { uuid } = await params;
    const response = await getAppointmentCached(uuid);

    if (!response) notFound();
    const appointmentResponse = await getAppointment(uuid);
    if (!appointmentResponse.success || !appointmentResponse.data?.appointment) notFound();
    return (
        <div>
            <AppointmentCard
                status={appointmentResponse.data.appointment.status}
                clinic={response.clinics}
                vetInfo={response.vetInfo}
                appointment={response.appointment}
                pet={response.pets}
                role={role_type.client}
                showAdditionalAction={true}
                veterinarian={response.veterinarians}
                vetId={response.veterinarians.vet_id}
            />
        </div>
    );
};

export default AppointmentDetails;
