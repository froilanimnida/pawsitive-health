import React, { Suspense } from "react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    SkeletonCard,
} from "@/components/ui";
import { type Metadata } from "next";
import { getVeterinarianAppointments } from "@/actions";
import Link from "next/link";
import { toTitleCase } from "@/lib";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Veterinary Appointment",
    description: "PawsitiveHealth is a pet health care service.",
};

const Appointments = async () => {
    const appointmentsResponse = await getVeterinarianAppointments();
    const appointments = appointmentsResponse.success ? (appointmentsResponse.data?.appointments ?? []) : [];
    if (!appointments || appointments.length === 0) {
        return (
            <div className="text-center py-10 w-full mx-auto">
                <h3 className="text-lg font-medium">No appointments found</h3>
                <p className="text-muted-foreground">Add your first appointment to get started</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
            {appointments.map((appointment) => (
                <Card key={appointment.appointment_id}>
                    <CardHeader>
                        <CardTitle>{toTitleCase(appointment.pets?.name)}</CardTitle>
                        <CardDescription>
                            {toTitleCase(appointment.veterinarians?.users?.first_name)}{" "}
                            {toTitleCase(appointment.veterinarians?.users?.last_name)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-2">
                            <div>
                                <span className="font-semibold">Date:</span>{" "}
                                {appointment.appointment_date.toDateString()}
                            </div>
                            <div>
                                <span className="font-semibold">Type:</span> {appointment.appointment_type}
                            </div>
                            <div>
                                <span className="font-semibold">Status:</span> {appointment.status}
                            </div>
                            <div>
                                <span className="font-semibold">Notes:</span> {appointment.notes}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>
                            <Link href={`/v/appointments/${appointment.appointment_uuid}`}>Manage</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

const VeterinaryAppointment = async () => {
    return (
        <section>
            <Suspense fallback={<SkeletonCard />}>
                <Appointments />
            </Suspense>
        </section>
    );
};

export default VeterinaryAppointment;
