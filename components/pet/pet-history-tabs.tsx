"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PetAppointmentsTable } from "./pet-appointments-table";
import { PetVaccinationsTable } from "./pet-vaccinations-table";
import { PetProceduresTable } from "./pet-procedures-table";
import { PetPrescriptionsTable, type PrescriptionData } from "./pet-prescriptions-table";
import type { appointments, healthcare_procedures, vaccinations } from "@prisma/client";

export function PetHistoryTabs({
    appointments,
    vaccinations,
    procedures,
    prescriptions,
}: {
    appointments: appointments[];
    vaccinations: vaccinations[];
    procedures: healthcare_procedures[];
    prescriptions: PrescriptionData[];
}) {
    const appointmentCount = appointments.length;
    const vaccinationCount = vaccinations.length;
    const procedureCount = procedures.length;
    const prescriptionCount = prescriptions.length;

    return (
        <Tabs defaultValue="appointments" className="w-full mt-6">
            <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="appointments">Appointments ({appointmentCount})</TabsTrigger>
                <TabsTrigger value="vaccinations">Vaccinations ({vaccinationCount})</TabsTrigger>
                <TabsTrigger value="procedures">Procedures ({procedureCount})</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions ({prescriptionCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="border rounded-md p-4">
                <PetAppointmentsTable appointments={appointments} />
            </TabsContent>

            <TabsContent value="vaccinations" className="border rounded-md p-4">
                <PetVaccinationsTable vaccinations={vaccinations} />
            </TabsContent>

            <TabsContent value="procedures" className="border rounded-md p-4">
                <PetProceduresTable procedures={procedures} />
            </TabsContent>

            <TabsContent value="prescriptions" className="border rounded-md p-4">
                <PetPrescriptionsTable prescriptions={prescriptions} />
            </TabsContent>
        </Tabs>
    );
}
