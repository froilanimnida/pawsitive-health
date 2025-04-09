"use client";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { changeAppointmentStatus } from "@/actions";
import { appointment_status } from "@prisma/client";

export const CheckInButton = ({ appointmentUuid }: { appointmentUuid: string }) => {
    const handleCheckIn = async () => {
        toast.loading("Changing appointment status to checked in...");
        const result = await changeAppointmentStatus(appointmentUuid, appointment_status.checked_in);
        if (result === undefined) {
            toast.dismiss();
            toast.success("Appointment status changed to checked in.");
            return;
        } else {
            if (result && !result.success && result.error) {
                toast.dismiss();
                toast.error(result.error);
                return;
            }
            toast.dismiss();
            toast.error("Failed to change appointment status.");
        }
    };
    return (
        <Button variant="default" onClick={handleCheckIn}>
            Change to Checked In
        </Button>
    );
};
