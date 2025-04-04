"use client";
import { cancelAppointment } from "@/actions/appointment";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

export const CancelAppointmentButton = ({ appointmentUuid }: { appointmentUuid: string }) => {
    const handleCancel = () => {
        toast.promise(cancelAppointment(appointmentUuid), {
            loading: "Cancelling appointment...",
            success: () => {
                return "Appointment cancelled successfully!";
            },
            error: (err) => {
                return err.message || "Failed to cancel appointment.";
            },
        });
        cancelAppointment(appointmentUuid);
    };
    return <Button onClick={handleCancel}>Cancel Appointment</Button>;
};
