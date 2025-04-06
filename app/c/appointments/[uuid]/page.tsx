import { getAppointment } from "@/actions";
import { AppointmentCard } from "@/components/shared/appointment-card";
import { notFound } from "next/navigation";
import React from "react";

const AppointmentDetails = async ({ params }: { params: Promise<{ uuid: string }> }) => {
    const { uuid } = await params;
    const appointmentResponse = await getAppointment(uuid, true);
    if (!appointmentResponse.success || !appointmentResponse.data?.appointment) notFound();
    const { appointment } = appointmentResponse.data;
    return (
        <div>
            <AppointmentCard appointment={appointment} viewerType="clinic" />
        </div>
    );
};

export default AppointmentDetails;
