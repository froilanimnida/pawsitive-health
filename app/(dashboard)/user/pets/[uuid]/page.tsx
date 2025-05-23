import { notFound } from "next/navigation";
import { getPet } from "@/actions";
import { getPetAppointments, getPetPrescriptions, getPetProcedures, getPetVaccinations } from "@/actions/pet-history";
import { getPetHealthMonitoring } from "@/actions/health-monitoring";
import type { Metadata } from "next";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    DialogHeader,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import Link from "next/link";
import { toTitleCase } from "@/lib";
import EditPetForm from "@/components/form/edit-pet-form";
import PetProcedureForm from "@/components/form/pet-healthcare-procedure-form";
import { VaccinationForm } from "@/components/form/veccination-form";
import { cache } from "react";
import { formatDistanceToNow } from "date-fns";
import { PetHistoryTabs } from "@/components/pet/pet-history-tabs";
import { HealthMonitoringDialog } from "@/components/pet/health-monitoring-dialog";
import { HealthMonitoringHistory } from "@/components/pet/health-monitoring-history";
import type { UUIDPageParams } from "@/types";
import PetProfileImage from "@/components/form/pet-profile-image";
import { ActivityLevelChart } from "@/components/pet/activity-level-chart";
import { PetHealthMetricsChart } from "@/components/pet/pet-health-metrics-chart";
import { WeightTrendChart } from "@/components/pet/weight-trend-chart";
import { Stethoscope, ActivityIcon, History, Weight, Pen, Syringe, Mars, VenusAndMars, Venus } from "lucide-react";
import { pet_sex_type } from "@prisma/client";
// Create a cached version of getPet
const getPetCached = cache(async (uuid: string) => {
    const response = await getPet(uuid);
    if (!response.success || !response.data?.pet) {
        return null;
    }
    return response.data.pet;
});

export async function generateMetadata({ params }: UUIDPageParams): Promise<Metadata> {
    const { uuid } = await params;
    const pet = await getPetCached(uuid);

    return {
        title: pet
            ? `${toTitleCase(pet.name)} | ${toTitleCase(pet.breed)} | PawsitiveHealth`
            : "Pet Details | PawsitiveHealth",
        description: pet ? `Details for ${pet.name}` : "Pet details page",
    };
}

const PetDetails = async ({ params }: UUIDPageParams) => {
    const { uuid } = await params;
    if (!uuid) notFound();

    const pet = await getPetCached(uuid);
    if (!pet) notFound();
    const { pet_id, breed, species, pet_uuid, name, sex, date_of_birth, weight_kg, updated_at } = pet;
    const appointmentsResponse = await getPetAppointments(pet_id);
    const vaccinationsResponse = await getPetVaccinations(pet_id);
    const proceduresResponse = await getPetProcedures(pet_id);
    const prescriptionsResponse = await getPetPrescriptions(pet_id);
    const healthMonitoringResponse = await getPetHealthMonitoring(pet_id);

    const appointments =
        appointmentsResponse.success && appointmentsResponse.data ? appointmentsResponse.data.appointments : [];
    const vaccinations =
        vaccinationsResponse.success && vaccinationsResponse.data ? vaccinationsResponse.data.vaccinations : [];
    const procedures = proceduresResponse.success && proceduresResponse.data ? proceduresResponse.data.procedures : [];
    const prescriptions =
        prescriptionsResponse.success && prescriptionsResponse.data ? prescriptionsResponse.data.prescriptions : [];
    const healthMonitoring =
        healthMonitoringResponse.success && healthMonitoringResponse.data
            ? healthMonitoringResponse.data.healthMonitoring
            : [];

    return (
        <div className="w-full mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Pet Information</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-start">
                    <div className="flex justify-center items-center">
                        <PetProfileImage
                            pet_id={pet.pet_id}
                            profile_picture_url={pet.profile_picture_url}
                            petUuid={pet_uuid}
                            name={pet.name}
                        />
                    </div>
                    <div className="flex flex-col justify-center items-start ml-4">
                        <CardTitle className="text-2xl">{name}</CardTitle>
                        <CardDescription>
                            {toTitleCase(species)} • {toTitleCase(breed)}
                        </CardDescription>
                    </div>
                    <div className="flex items-center ml-auto">
                        {pet.sex === "male" && <Mars className="h-5 w-5 text-blue-500" />}
                        {pet.sex === "female" && <Venus className="h-5 w-5 text-pink-500" />}
                        {(!pet.sex || pet.sex === pet_sex_type.prefer_not_to_say) && (
                            <VenusAndMars className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <h1 className="text-sm font-medium text-muted-foreground">Species</h1>
                                <p>{toTitleCase(species)}</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Breed</h1>
                                <p>{toTitleCase(breed)}</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Sex</h1>
                                <p>{toTitleCase(sex)}</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Date of Birth</h1>
                                <p>{new Date(date_of_birth).toLocaleDateString()}</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Weight</h1>
                                <p>{weight_kg?.toString()} kg</p>
                                <h1 className="text-sm font-medium text-muted-foreground">Last Updated</h1>
                                <p>{formatDistanceToNow(updated_at, { addSuffix: true, includeSeconds: true })}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Pen />
                                Edit Pet
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Pet</DialogTitle>
                                <DialogDescription>Update your pet&apos;s information.</DialogDescription>
                            </DialogHeader>
                            <EditPetForm petName={name} weightKg={Number(weight_kg)} petId={pet_id} />
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Stethoscope />
                                Add Pet Procedure
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Pet Healthcare Procedure</DialogTitle>
                                <DialogDescription>Add historical pet procedure</DialogDescription>
                            </DialogHeader>
                            <PetProcedureForm petUuid={pet_uuid} petId={pet_id} />
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Syringe />
                                Add Pet Vaccination
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Pet Vaccination</DialogTitle>
                                <DialogDescription>Add historical pet vaccination</DialogDescription>
                            </DialogHeader>
                            <VaccinationForm petUuid={pet_uuid} petId={pet_id} isUserView={true} />
                        </DialogContent>
                    </Dialog>

                    <HealthMonitoringDialog
                        petId={pet_id}
                        petUuid={pet_uuid}
                        petName={name}
                        petCurrentWeight={Number(pet.weight_kg)}
                    />

                    <Button asChild variant="default" className="md:col-span-2">
                        <Link href={`/user/appointments/${pet_uuid}`}>Schedule Appointment</Link>
                    </Button>
                </CardFooter>
            </Card>

            <Tabs defaultValue="history" className="w-full ">
                <TabsList className="mb-4 w-full">
                    <TabsTrigger value="history">
                        <Stethoscope />
                        Medical History
                    </TabsTrigger>
                    <TabsTrigger value="monitoring">
                        <ActivityIcon />
                        Health Monitoring
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Pet History</CardTitle>
                            <CardDescription>
                                View all health records, appointments, and medical history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PetHistoryTabs
                                appointments={appointments}
                                vaccinations={vaccinations}
                                procedures={procedures}
                                prescriptions={prescriptions}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="monitoring">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Health Monitoring</CardTitle>
                            <CardDescription>Track your pet&apos;s health metrics over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HealthMonitoringHistory healthRecords={healthMonitoring} petUuid={pet_uuid} />

                            <Tabs defaultValue="overview" className="w-full mt-5">
                                <TabsList className="mb-4 w-full">
                                    <TabsTrigger value="overview">
                                        <History />
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="activity">
                                        <ActivityIcon />
                                        Activity
                                    </TabsTrigger>
                                    <TabsTrigger value="weight">
                                        <Weight />
                                        Weight
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview">
                                    <PetHealthMetricsChart healthRecords={healthMonitoring} petName={pet.name} />
                                </TabsContent>

                                <TabsContent value="activity">
                                    <ActivityLevelChart healthRecords={healthMonitoring} petName={pet.name} />
                                </TabsContent>

                                <TabsContent value="weight">
                                    <WeightTrendChart
                                        healthRecords={healthMonitoring}
                                        petName={pet.name}
                                        idealWeightMin={pet.species === "dog" ? 10 : 3} // Example values
                                        idealWeightMax={pet.species === "dog" ? 25 : 6} // Example values
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PetDetails;
