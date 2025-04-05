import React from "react";
import { notFound } from "next/navigation";
import { getAppointment } from "@/actions";
import { Metadata } from "next";
import { AppointmentCard } from "@/components/shared/appointment-card";

export const metadata: Metadata = {
    title: "View Appointment | PawsitiveHealth",
    description: "View your pet's appointment details",
};

const ViewAppointment = async ({ params }: { params: Promise<{ appointment_uuid: string }> }) => {
    const { appointment_uuid } = await params;
    const appointmentResponse = await getAppointment(appointment_uuid, true);
    if (!appointmentResponse.success || !appointmentResponse.data?.appointment) notFound();
    const { appointment } = appointmentResponse.data;

    return (
        <div className="container max-w-4xl py-6">
            <AppointmentCard appointment={appointment} viewerType="user" />
        </div>
    );
};

export default ViewAppointment;
