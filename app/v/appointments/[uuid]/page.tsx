import React from "react";
import { AppointmentCard } from "@/components/shared/appointment-card";
import { notFound } from "next/navigation";
import { getAppointment } from "@/actions/appointment";
import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "View Appointment | PawsitiveHealth",
    description: "View your pet's appointment details",
};

const ViewAppointment = async ({ params }: { params: Promise<{ uuid: string }> }) => {
    const { uuid } = await params;
    const appointmentResponse = await getAppointment(uuid, true);
    console.log("Appointment Response", appointmentResponse);
    if (!appointmentResponse.success || !appointmentResponse.data?.appointment) {
        notFound();
    }
    const { appointment } = appointmentResponse.data;
    const handleCancelAppointment = () => {
        // Logic goes here
    };
    const handleRescheduleAppointment = () => {
        // Logic here
    };
    return (
        <div>
            <AppointmentCard
                appointment={appointment}
                viewerType="vet"
                onCancel={handleCancelAppointment}
                onReschedule={handleRescheduleAppointment}
            />
        </div>
    );
};

export default ViewAppointment;
