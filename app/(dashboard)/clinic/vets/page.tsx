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
    Avatar,
    AvatarFallback,
} from "@/components/ui";
import NewVeterinaryForm from "@/components/form/new-vet-form";
import { getClinic, getUser, getVeterinarians } from "@/actions";
import Link from "next/link";
import { toTitleCase } from "@/lib";
import type { veterinarians } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata = {
    title: "PawsitiveHealth | Veterinarians",
    description: "PawsitiveHealth is a pet health care service.",
};

const VeterinaryCard = async ({ veterinary }: { veterinary: veterinarians }) => {
    const user = await getUser(veterinary.user_id as number);
    if (!user.success) {
        return (
            <Card key={veterinary.license_number}>
                <CardHeader>
                    <CardTitle>Veterinarian not found</CardTitle>
                </CardHeader>
            </Card>
        );
    }
    return (
        <Card key={veterinary.license_number}>
            <CardHeader className="flex flex-row items-center">
                <Avatar className="h-14 w-14">
                    <AvatarFallback className="text-lg">
                        {user.data.user.first_name.charAt(0)}
                        {user.data.user.last_name.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                    <CardTitle>
                        {user.data.user.first_name} {user.data.user.last_name}
                    </CardTitle>
                    <CardDescription>{toTitleCase(veterinary.specialization)}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm">License: {veterinary.license_number}</p>
                <p className="text-sm mt-1">
                    <span className="font-medium">Contact:</span> {user.data.user.email}
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/clinic/vets/${veterinary.vet_uuid}`}>Manage</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

const Veterinaries = async () => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return null;
    }

    // Use the proper type parameter "user_id" to indicate we're looking up by user_id
    const clinicInfo = await getClinic(Number(session.user.id), "user_id");
    console.log(clinicInfo);

    if (!clinicInfo.success) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">Clinic not found</h3>
                <p className="text-muted-foreground">Please register your clinic first</p>
            </div>
        );
    }

    const data = await getVeterinarians(clinicInfo.data.clinic.clinic_id);
    const veterinaries = data.success ? (data.data?.veterinarians ?? []) : [];

    if (!veterinaries || veterinaries.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No veterinarians found</h3>
                <p className="text-muted-foreground">Add your first veterinarian to get started</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {veterinaries.map((veterinary) => (
                    <VeterinaryCard key={veterinary.license_number} veterinary={veterinary} />
                ))}
            </div>
        </div>
    );
};

const Veterinary = () => {
    return (
        <section className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Veterinarians</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Add Veterinarian</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Veterinarian</DialogTitle>
                            <DialogDescription>
                                Please provide the details of the new veterinarian you want to add.
                            </DialogDescription>
                        </DialogHeader>
                        <NewVeterinaryForm />
                    </DialogContent>
                </Dialog>
            </div>
            <Suspense fallback={<SkeletonCard />}>
                <Veterinaries />
            </Suspense>
        </section>
    );
};

export default Veterinary;
