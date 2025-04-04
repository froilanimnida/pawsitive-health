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
import AddPetForm from "@/components/form/pet-form";
import type { Metadata } from "next";
import { getPets } from "@/actions/pets";
import { calculateAge } from "@/lib/functions/calculate-age";
import Link from "next/link";
import { toTitleCase } from "@/lib/functions/text/title-case";

export const metadata: Metadata = {
    title: "PawsitiveHealth | User Pets",
    description: "PawsitiveHealth is a pet health care service.",
};

async function PetList() {
    const pets = await getPets();
    const petsData = pets.success ? (pets.data?.pets ?? []) : [];
    if (!petsData || petsData.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No pets found</h3>
                <p className="text-muted-foreground">Add your first pet to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 w-full lg:grid-cols-3 gap-4">
            {petsData.map((pet) => (
                <Card key={pet.pet_id}>
                    <CardHeader>
                        <CardTitle>{toTitleCase(pet.name)}</CardTitle>
                        <CardDescription>{toTitleCase(pet.breed)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Species: {toTitleCase(pet.species)}</p>
                        {pet.date_of_birth && <p>Age: {String(calculateAge(new Date(pet.date_of_birth), "full"))}</p>}
                    </CardContent>
                    <CardFooter>
                        <Link href={`/u/pets/${pet.pet_uuid}`}>
                            <Button>View</Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
const PetsPage = () => {
    return (
        <section className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Pets</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Add Pet</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a new pet to your account</DialogTitle>
                            <DialogDescription>
                                Please provide the details of your pet to add it to your account.
                            </DialogDescription>
                        </DialogHeader>
                        <AddPetForm />
                    </DialogContent>
                </Dialog>
            </div>
            <Suspense fallback={<SkeletonCard />}>
                <PetList />
            </Suspense>
        </section>
    );
};

export default PetsPage;
