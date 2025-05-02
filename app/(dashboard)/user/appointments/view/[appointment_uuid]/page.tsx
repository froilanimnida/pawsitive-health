import { notFound } from "next/navigation";
import { getAppointment } from "@/actions";
import { Metadata } from "next";
import { AppointmentCard } from "@/components/shared/appointment-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
    title: "View Appointment | PawsitiveHealth",
    description: "View your pet's appointment details",
};

const ViewAppointment = async ({ params }: { params: Promise<{ appointment_uuid: string }> }) => {
    const { appointment_uuid } = await params;
    const appointmentResponse = await getAppointment(appointment_uuid, true);
    if (!appointmentResponse.success || !appointmentResponse.data?.appointment) notFound();
    const { appointment } = appointmentResponse.data;

    const ChatButton = () => (
        <Link href={`/user/appointments/view/${appointment_uuid}/thread`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat with Vet</span>
            </Button>
        </Link>
    );

    return (
        <div className="container max-w-4xl py-6">
            <AppointmentCard appointment={appointment} viewerType="user" additionalActions={<ChatButton />} />
        </div>
    );
};

export default ViewAppointment;
