import { Suspense } from "react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    SkeletonCard,
} from "@/components/ui";
import type { Metadata } from "next";
import { getPets } from "@/actions";
import { calculateAge, toTitleCase } from "@/lib";
import Link from "next/link";
import AddPetForm from "@/components/form/pet-form";

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
                        <Link href={`/user/pets/${pet.pet_uuid}`}>
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
                    <DialogContent className=" max-h-11/12 overflow-y-auto w-full">
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
            <Suspense
                fallback={Array.from({ length: 16 }, (_, i) => (
                    <SkeletonCard key={i} />
                ))}
            >
                <PetList />
            </Suspense>
        </section>
    );
};

export default PetsPage;
