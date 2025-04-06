import { notFound } from "next/navigation";
import { getPet } from "@/actions";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button } from "@/components/ui";
import Link from "next/link";
import { toTitleCase } from "@/lib";

export async function generateMetadata({ params }: { params: Promise<{ uuid: string }> }): Promise<Metadata> {
    const { uuid } = await params;
    const data = await getPet(uuid);
    const pet = data.success ? data.data?.pet : null;
    return {
        title: pet
            ? `${toTitleCase(pet.name)} | ${toTitleCase(pet.breed)} | PawsitiveHealth`
            : "Pet Details | PawsitiveHealth",
        description: pet ? `Details for ${pet.name}` : "Pet details page",
    };
}

export default async function PetDetails({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;

    if (!uuid) notFound();

    const data = await getPet(uuid);
    const pet = data.success ? data.data?.pet : null;

    if (!pet) notFound();

    return (
        <div className="container mx-auto p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">{pet.name}</CardTitle>
                    <CardDescription>
                        {toTitleCase(pet.species)} • {toTitleCase(pet.breed)}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Pet Information</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <h1 className="text-sm font-medium text-muted-foreground">Species</h1>
                                <p>{toTitleCase(pet.species)}</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Breed</h1>
                                <p>{toTitleCase(pet.breed)}</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Sex</h1>
                                <p>{toTitleCase(pet.sex)}</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Date of Birth</h1>
                                <p>{new Date(pet.date_of_birth).toLocaleDateString()}</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Weight</h1>
                                <p>{pet.weight_kg?.toString()} kg</p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline">Edit Pet</Button>
                    <Button asChild variant="default">
                        <Link href={`/u/appointments/${pet.pet_uuid}`}>Schedule Appointment</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
