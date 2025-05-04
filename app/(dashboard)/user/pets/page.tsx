import { Suspense } from "react";
import {
    Button,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Dialog,
    SkeletonCard,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import { getPets } from "@/actions";
import AddPetForm from "@/components/form/pet-form";
import PetCard from "@/components/pet/pet-card";
import { species_type } from "@prisma/client";
import { Dog, Cat, PawPrint } from "lucide-react";

export const metadata = {
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

    const allPets = petsData;
    const dogs = petsData.filter((p) => p.species === species_type.dog);
    const cats = petsData.filter((p) => p.species === species_type.cat);

    return (
        <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 w-full">
                <TabsTrigger value="all">
                    <PawPrint />
                    All Pets ({allPets.length})
                </TabsTrigger>
                <TabsTrigger value="dogs">
                    <Dog /> Dogs ({dogs.length})
                </TabsTrigger>
                <TabsTrigger value="cats">
                    <Cat />
                    Cats ({cats.length})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
                <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allPets.map((pet) => (
                        <PetCard key={pet.pet_id} pet={pet} />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="dogs">
                {dogs.length > 0 ? (
                    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dogs.map((pet) => (
                            <PetCard key={pet.pet_id} pet={pet} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <h3 className="text-lg font-medium">No dogs found</h3>
                        <p className="text-muted-foreground">Add your first dog to get started</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="cats">
                {cats.length > 0 ? (
                    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cats.map((pet) => (
                            <PetCard key={pet.pet_id} pet={pet} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <h3 className="text-lg font-medium">No cats found</h3>
                        <p className="text-muted-foreground">Add your first cat to get started</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
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
                fallback={
                    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }, (_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                }
            >
                <PetList />
            </Suspense>
        </section>
    );
};

export default PetsPage;
