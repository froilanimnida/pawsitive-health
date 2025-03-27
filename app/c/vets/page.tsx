import React, { Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import NewVeterinaryForm from "@/components/form/new-vet-form";
import type { Metadata } from "next";
import { getClinicVeterinarians } from "@/actions/veterinary";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Veterinaries",
    description: "PawsitiveHealth is a pet health care service.",
};

const Veterinaries = async () => {
    const veterinaries = await getClinicVeterinarians();
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
            {veterinaries.map((veterinary) => (
                <Card key={veterinary.license_number}>
                    <CardHeader>
                        <CardTitle>
                            {veterinary.users?.first_name} {veterinary.users?.last_name}
                        </CardTitle>
                        <CardDescription>{veterinary.specialization}</CardDescription>
                    </CardHeader>
                    <CardContent>{veterinary.license_number}</CardContent>
                    <CardFooter>
                        <Button>Manage</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

const Veterinary = () => {
    return (
        <section className="p-4 w-full">
            <Suspense fallback={<SkeletonCard />}>
                <Veterinaries />
            </Suspense>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Add Veterinary</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Veterinary</DialogTitle>
                        <DialogDescription>
                            Please provide the details of the new veterinary you want to add.
                        </DialogDescription>
                    </DialogHeader>
                    <NewVeterinaryForm />
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default Veterinary;
