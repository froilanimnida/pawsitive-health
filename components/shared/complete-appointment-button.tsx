"use client";
import { completeAppointment } from "@/actions";
import { Button } from "@/components/ui";
import { toast } from "sonner";

export const CompleteAppointmentButton = ({ appointmentUuid }: { appointmentUuid: string }) => {
    const handleCancel = () => {
        toast.promise(completeAppointment(appointmentUuid), {
            loading: "Processing...",
            success: () => {
                return "Appointment completed successfully.";
            },
            error: (err) => {
                return err.message || "Failed to complete appointment.";
            },
        });
    };
    return (
        <Button variant={"destructive"} onClick={handleCancel}>
            Complete Appointment
        </Button>
    );
};
