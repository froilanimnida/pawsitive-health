"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PetAppointmentsTable } from "./pet-appointments-table";
import { PetVaccinationsTable } from "./pet-vaccinations-table";
import { PetProceduresTable } from "./pet-procedures-table";
import { PetPrescriptionsTable } from "./pet-prescriptions-table";
import type { appointments, healthcare_procedures, vaccinations } from "@prisma/client";
import type { PrescriptionData } from "@/types";

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
            <TabsList className="w-full">
                <TabsTrigger value="appointments">Appointments ({appointmentCount})</TabsTrigger>
                <TabsTrigger value="vaccinations">Vaccinations ({vaccinationCount})</TabsTrigger>
                <TabsTrigger value="procedures">Procedures ({procedureCount})</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions ({prescriptionCount})</TabsTrigger>
            </TabsList>

            <div className="w-full border rounded-md p-4 max-w-full overflow-scroll">
                <div className="min-w-full">
                    <TabsContent value="appointments" className="mt-0 data-[state=active]:block">
                        <PetAppointmentsTable appointments={appointments} />
                    </TabsContent>

                    <TabsContent value="vaccinations" className="mt-0 data-[state=active]:block">
                        <PetVaccinationsTable vaccinations={vaccinations} />
                    </TabsContent>

                    <TabsContent value="procedures" className="mt-0 data-[state=active]:block">
                        <PetProceduresTable procedures={procedures} />
                    </TabsContent>

                    <TabsContent value="prescriptions" className="mt-0 data-[state=active]:block">
                        <PetPrescriptionsTable prescriptions={prescriptions} />
                    </TabsContent>
                </div>
            </div>
        </Tabs>
    );
}
