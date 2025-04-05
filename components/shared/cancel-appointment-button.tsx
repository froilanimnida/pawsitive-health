"use client";
import { cancelAppointment } from "@/actions";
import { Button } from "@/components/ui";
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
    return (
        <Button variant={"destructive"} onClick={handleCancel}>
            Cancel Appointment
        </Button>
    );
};
