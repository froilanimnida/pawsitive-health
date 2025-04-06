"use client";
import { confirmAppointment } from "@/actions";
import { Button } from "@/components/ui";
import { toast } from "sonner";

export const AcceptAppointmentButton = ({ appointmentUuid }: { appointmentUuid: string }) => {
    const handleAccept = () => {
        toast.promise(confirmAppointment(appointmentUuid), {
            loading: "Confirming appointment...",
            success: () => {
                return "Appointment confirmed successfully!";
            },
            error: (err) => {
                return err.message || "Failed to confirm appointment.";
            },
        });
    };
    return (
        <Button variant={"default"} onClick={handleAccept}>
            Accept Appointment
        </Button>
    );
};
