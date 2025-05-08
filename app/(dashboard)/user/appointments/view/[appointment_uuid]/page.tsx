import { notFound } from "next/navigation";
import { getAppointment, getClinic, getMessages, getPet, getUser, getVeterinarian } from "@/actions";
import { AppointmentCard } from "@/components/shared/appointment-card";
import AppointmentChat from "@/components/shared/appointment-chat";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { role_type } from "@prisma/client";

export const metadata = {
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
    const messagesResponse = await getMessages(response.data.appointment.appointment_id);
    if (
        !clinicResponse.success ||
        !petResponse.success ||
        !clinicResponse.data.clinic ||
        !veterinarianResponse.success ||
        !veterinarianResponse.data.veterinarian.user_id ||
        !messagesResponse.success
    ) {
        return null;
    }
    const vetInfoResponse = await getUser(veterinarianResponse.data.veterinarian.user_id);
    if (!vetInfoResponse.success) {
        return null;
    }
    return {
        appointment: response.data.appointment,
        clinics: clinicResponse.data.clinic,
        pets: petResponse.data.pet,
        veterinarians: veterinarianResponse.data.veterinarian,
        vetInfo: vetInfoResponse.data.user,
        messages: messagesResponse.data.messages,
    };
});

async function ViewAppointment({ params }: { params: Promise<{ appointment_uuid: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.role) {
        return notFound();
    }
    const { appointment_uuid } = await params;
    const response = await getAppointmentCached(appointment_uuid);
    if (!response) notFound();

    // Infer participants at the top level
    const chatParticipants = {
        currentUserId: Number(session.user.id),
        otherUserId: response.vetInfo.user_id,
        appointmentId: response.appointment.appointment_id,
    };

    return (
        <div className="w-full py-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AppointmentCard
                status={response.appointment.status}
                clinic={response.clinics}
                vetInfo={response.vetInfo}
                appointment={response.appointment}
                pet={response.pets}
                role={role_type.user}
                veterinarian={response.veterinarians}
                vetId={response.veterinarians.vet_id}
            />
            <AppointmentChat
                initialMessages={response.messages}
                appointmentStatus={response.appointment.status}
                chatParticipants={chatParticipants}
                isVetView={false}
            />
        </div>
    );
}

export default ViewAppointment;
