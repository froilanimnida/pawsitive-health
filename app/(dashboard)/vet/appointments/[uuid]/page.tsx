import { AppointmentCard } from "@/components/shared/appointment-card";
import { notFound } from "next/navigation";
import {
    getAppointment,
    getHealthcareProcedures,
    getMedicalRecords,
    getMedicationsList,
    getMessages,
    getPet,
    getPetHealthMonitoring,
    getPetVaccinations,
} from "@/actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import { AppointmentHealthcareForms } from "@/components/form/appointment-healthcare-forms";
import AppointmentHistoricalData from "@/components/shared/appointment-historical-data";
import CurrentAppointmentRecordedService from "@/components/shared/veterinary/session-data";
import AppointmentChat from "@/components/shared/appointment-chat";
import type { UUIDPageParams } from "@/types";
import { cache } from "react";
import { appointment_status, role_type, species_type } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ActivityLevelChart } from "@/components/pet/activity-level-chart";
import { WeightTrendChart } from "@/components/pet/weight-trend-chart";
import { PetHealthMetricsChart } from "@/components/pet/pet-health-metrics-chart";
import { Weight, Activity, History } from "lucide-react";

const getAppointmentCached = cache(async (uuid: string) => {
    const response = await getAppointment(uuid);
    if (
        !response.success ||
        !response.data?.appointment ||
        !response.data.appointment.pet_id ||
        response.data.appointment.vet_id === null
    ) {
        return null;
    }
    const getVaccinationsResponse = await getPetVaccinations(response.data.appointment.pet_id);
    const pastHealthMonitoringResponse = await getPetHealthMonitoring(response.data.appointment.pet_id);
    const petMedicalHistoryResponse = await getMedicalRecords(response.data.appointment.pet_id);
    const medicationResponse = await getMedicationsList();
    const petResponse = await getPet(response.data.appointment.pet_id);
    const petHealthCareProceduresResponse = await getHealthcareProcedures(response.data.appointment.pet_id);
    const messagesResponse = await getMessages(response.data.appointment.appointment_id);
    if (
        !petResponse.success ||
        !petResponse.data.pet ||
        petResponse.data.pet.user_id === null ||
        !pastHealthMonitoringResponse.success ||
        !getVaccinationsResponse.success ||
        !medicationResponse.success ||
        !petMedicalHistoryResponse.success ||
        !petHealthCareProceduresResponse.success ||
        !messagesResponse.success
    ) {
        return null;
    }
    return {
        appointment: response.data.appointment,
        pet: petResponse.data.pet,
        medicalHistory: petMedicalHistoryResponse.data.medicalRecords,
        vaccinations: getVaccinationsResponse.data.vaccinations,
        healthMonitoring: pastHealthMonitoringResponse.data.healthMonitoring,
        medications: medicationResponse.data.medication,
        procedures: petHealthCareProceduresResponse.data.procedures,
        messages: messagesResponse.data.messages,
    };
});

export const metadata = {
    title: "View Appointment | PawsitiveHealth",
    description: "View your pet's appointment details",
};

const ViewAppointment = async ({ params }: UUIDPageParams) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.role) {
        return notFound();
    }
    const { uuid } = await params;

    if (!uuid) return notFound();
    const appointmentData = await getAppointmentCached(uuid);
    if (!appointmentData) notFound();

    const { appointment, healthMonitoring, medicalHistory, vaccinations, medications, pet, procedures, messages } =
        appointmentData;

    const chatParticipants = {
        currentUserId: Number(session.user.id),
        otherUserId: pet.user_id as number,
        appointmentId: appointment.appointment_id,
    };

    return (
        <section className="space-y-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AppointmentCard
                pet={pet}
                status={appointment.status}
                appointment={appointment}
                role={role_type.veterinarian}
                vetId={appointment.vet_id as number}
                showAdditionalAction={true}
            />
            {(appointment.status === appointment_status.checked_in ||
                appointment.status === appointment_status.confirmed) && (
                <AppointmentHistoricalData
                    vaccinations={vaccinations}
                    appointmentUuid={appointment.appointment_uuid}
                    petName={pet.name}
                    status={appointment.status}
                    healthcareProcedures={procedures}
                    medicalRecords={medicalHistory}
                />
            )}
            {appointment.status === appointment_status.checked_in && (
                <Card>
                    <CardHeader>
                        <CardTitle>Record Services</CardTitle>
                        <CardDescription>
                            Document services provided during this appointment for {pet?.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AppointmentHealthcareForms
                            isVetView
                            medicationList={medications}
                            petUuid={pet.pet_uuid}
                            petId={pet.pet_id}
                            appointmentId={appointment.appointment_id}
                            appointmentUuid={appointment.appointment_uuid}
                            petName={pet.name}
                        />
                    </CardContent>
                </Card>
            )}
            <CurrentAppointmentRecordedService appointmentUuid={appointment.appointment_uuid} />
            <AppointmentChat
                initialMessages={messages}
                appointmentStatus={appointment.status}
                chatParticipants={chatParticipants}
                isVetView={true}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Health Monitoring</CardTitle>
                    <CardDescription>View the health metrics and activity levels of {pet.name}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview">
                        <TabsList className="w-full">
                            <TabsTrigger value="overview">
                                <History />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="activity">
                                {" "}
                                <Activity /> Activity
                            </TabsTrigger>
                            <TabsTrigger value="weight">
                                <Weight /> Weight
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
                                idealWeightMin={pet.species === species_type.dog ? 10 : 3} // Example values
                                idealWeightMax={pet.species === species_type.dog ? 25 : 6} // Example values
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </section>
    );
};

export default ViewAppointment;
