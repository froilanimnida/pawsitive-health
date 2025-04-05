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
import { type Metadata } from "next";
import { getMedicationsList } from "@/actions/medications";
import MedicineForm from "@/components/form/medicine-form";

export const metadata: Metadata = {
    title: "Pawsitive Health | Medicines",
    description: "List of medicines",
};

const MedicineCardList = async () => {
    const medicines = await getMedicationsList();
    const medicinesData = medicines.success ? (medicines.data?.medication ?? []) : [];
    if (!medicinesData || medicinesData.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No medicines found</h3>
                <p className="text-muted-foreground">Add your first medicine to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
            {medicinesData.map((medicine) => (
                <Card key={medicine.medication_uuid}>
                    <CardHeader>
                        <CardTitle>{medicine.name}</CardTitle>
                        <CardDescription>{medicine.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Usage Instructions: {medicine.usage_instructions}</p>
                        <p>Side Effects: {medicine.side_effects}</p>
                    </CardContent>
                    <CardFooter>
                        <Button>View</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

const Medicines = () => {
    return (
        <section className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Medicines</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Add Medicine</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Medicine</DialogTitle>
                            <DialogDescription>Fill in the details of the new medicine.</DialogDescription>
                        </DialogHeader>
                        <MedicineForm />
                    </DialogContent>
                </Dialog>
            </div>
            <Suspense fallback={<SkeletonCard />}>
                <MedicineCardList />
            </Suspense>
        </section>
    );
};

export default Medicines;
