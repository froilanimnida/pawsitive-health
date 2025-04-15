"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import PrescriptionForm from "../form/prescription-form";
import { useState } from "react";
import PetVaccinationForm from "./pet-vaccination-form";
import PetProcedureForm from "./pet-healthcare-form";
//import type { medications } from "@prisma/client";

interface AppointmentHealthcareFormsProps {
    petId: number;
    appointmentUuid: string;
    appointmentId?: number;
    //medicationLists: medications[];
}

export function AppointmentHealthcareForms({ petId, appointmentUuid, appointmentId }: AppointmentHealthcareFormsProps) {
    const [activeTab, setActiveTab] = useState("vaccination");
    return (
        <div className="mt-6 space-y-4">
            <Tabs defaultValue="vaccination" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                    <TabsTrigger value="vaccination">Vaccination</TabsTrigger>
                    <TabsTrigger value="procedure">Healthcare Procedure</TabsTrigger>
                    <TabsTrigger value="prescription">Prescription</TabsTrigger>
                </TabsList>

                <TabsContent value="vaccination" className="p-4 border rounded-md bg-card">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Record Vaccination</h3>
                        <p className="text-sm text-muted-foreground">
                            Record vaccines administered during this appointment
                        </p>
                    </div>
                    <PetVaccinationForm
                        //petUuid={petUuid}
                        petId={petId}
                        petUuid={appointmentUuid}
                    />
                </TabsContent>

                <TabsContent value="procedure" className="p-4 border rounded-md bg-card">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Record Healthcare Procedure</h3>
                        <p className="text-sm text-muted-foreground">
                            Document medical procedures performed during this appointment
                        </p>
                    </div>
                    <PetProcedureForm
                        petId={petId}
                        appointmentId={appointmentId}
                        //appointmentUuid={appointmentUuid}
                    />
                </TabsContent>

                <TabsContent value="prescription" className="p-4 border rounded-md bg-card">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Issue Prescription</h3>
                        <p className="text-sm text-muted-foreground">Create prescriptions for medications</p>
                    </div>
                    <PrescriptionForm petId={petId} appointmentUuid={appointmentUuid} appointmentId={appointmentId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
