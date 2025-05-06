import { getClinics, getUserPetsList } from "@/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { Metadata } from "next";
import AppointmentForm from "@/components/form/appointment-form/index";
import { notFound } from "next/navigation";
import type { UUIDPageParams } from "@/types";

export const metadata: Metadata = {
    title: "PawsitiveHealth | New Appointment",
    description: "PawsitiveHealth is a pet health care service.",
};

const NewAppointment = async ({ params }: UUIDPageParams) => {
    const { uuid } = await params;
    const petsResponse = await getUserPetsList();
    const pets = petsResponse.success ? (petsResponse.data?.pets ?? []) : [];
    const clinicsResponse = await getClinics();
    const clinics = clinicsResponse.success ? (clinicsResponse.data?.clinics ?? []) : [];
    if (!pets || pets.length === 0) notFound();
    return (
        <Card>
            <CardHeader>
                <CardTitle>New Appointment</CardTitle>
                <CardDescription>Book a new appointment</CardDescription>
            </CardHeader>
            <CardContent>
                <AppointmentForm params={{ uuid, pets, clinics }} />
            </CardContent>
        </Card>
    );
};

export default NewAppointment;
