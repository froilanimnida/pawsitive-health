import React, { Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import type { Metadata } from "next";
import { getUserAppointments } from "@/actions/appointment";
import Link from "next/link";
import { toTitleCase } from "@/lib/functions/text/title-case";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogFooter,
    DialogHeader,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Appointments",
    description: "PawsitiveHealth is a pet health care service.",
};

const AppointmentsHistory = async () => {
    const data = await getUserAppointments();
    const appointments = data.success ? data.data?.appointments ?? [] : [];
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
                        <CardTitle>{toTitleCase(appointment.pets?.name ?? "")}</CardTitle>
                        <CardDescription>
                            {toTitleCase(appointment.veterinarians?.users?.first_name)}{" "}
                            {toTitleCase(appointment.veterinarians?.users?.last_name)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge>{appointment.status.toLocaleUpperCase()}</Badge>
                        <div className="flex flex-col space-y-2">
                            <div>
                                <span className="font-semibold">Date:</span>{" "}
                                {appointment.appointment_date.toDateString()}
                            </div>
                            <div>
                                <span className="font-semibold">Time:</span>{" "}
                                {appointment.appointment_date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                            <div>
                                <span className="font-semibold">Type:</span> {toTitleCase(appointment.appointment_type)}
                            </div>
                            <div>
                                <span className="font-semibold">Notes:</span> {appointment.notes}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant={"outline"}>
                            <Link href={`/u/appointments/view/${appointment.appointment_uuid}`}>View</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

function Appointments() {
    return (
        <section className="p-4 w-full min-h-screen">
            <Suspense fallback={<SkeletonCard />}>
                <AppointmentsHistory />
            </Suspense>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>New Appointment</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Appointment</DialogTitle>
                        <DialogDescription>
                            Please select a pet and a veterinarian to create a new appointment.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button asChild>
                                <Link href="/u/pets">Okay</Link>
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}

export default Appointments;
