"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    Separator,
} from "@/components/ui";
import { FileText, History, Pill, Syringe, Stethoscope, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getAppointmentHistoricalData } from "@/actions/appointment";
import { toTitleCase } from "@/lib/functions/text/title-case";

interface AppointmentHistoricalDataProps {
    appointmentUuid: string;
    petName: string;
    status: string;
}

export function AppointmentHistoricalData({ appointmentUuid, petName, status }: AppointmentHistoricalDataProps) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [healthData, setHealthData] = useState<{
        vaccinations: {
            id: number;
            vaccine_name: string | null;
            administered_date: Date | null;
            batch_number: string | null;
            veterinarians: {
                users: {
                    first_name: string;
                    last_name: string;
                } | null;
            } | null;
        }[];
        healthcareProcedures: {
            id: number;
            procedure_type: string;
            procedure_date: Date | null;
            product_used: string | null;
            dosage: string | null;
            notes: string | null;
            veterinarians: {
                users: {
                    first_name: string;
                    last_name: string;
                } | null;
            } | null;
        }[];
        prescriptions: {
            id: number;
            medication_name?: string;
            dosage: string;
            frequency: string;
            start_date: Date | null;
            end_date: Date | null;
            medications: {
                name: string;
            } | null;
            veterinarians: {
                users: {
                    first_name: string;
                    last_name: string;
                } | null;
            } | null;
        }[];
        medicalRecords: {
            id: number;
            diagnosis: string | null;
            visit_date: Date | null;
            notes: string | null;
            veterinarians: {
                users: {
                    first_name: string;
                    last_name: string;
                } | null;
            } | null;
        }[];
    } | null>(null);

    // Only allow access if appointment is confirmed or checked in
    const canAccessHistoricalData = status === "confirmed" || status === "checked_in";

    useEffect(() => {
        if (isOpen && !healthData && canAccessHistoricalData) {
            loadHealthData();
        }
    }, [isOpen, canAccessHistoricalData]);

    const loadHealthData = async () => {
        setLoading(true);
        try {
            const response = await getAppointmentHistoricalData(appointmentUuid);
            if (response.success && response.data) {
                setHealthData(response.data);
            }
        } catch (error) {
            console.error("Failed to load health data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "Not recorded";
        return format(new Date(date), "MMM d, yyyy");
    };

    // If appointment is not confirmed or checked in, don't render the component
    if (!canAccessHistoricalData) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    View Health History
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">{petName}'s Health History</DialogTitle>
                    <DialogDescription>
                        View past vaccinations, prescriptions, healthcare procedures, and medical records
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 text-center">
                        <p className="text-muted-foreground">Loading health history...</p>
                    </div>
                ) : (
                    <Tabs defaultValue="vaccinations" className="mt-4">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="vaccinations">
                                <Syringe className="h-4 w-4 mr-2" />
                                Vaccinations
                            </TabsTrigger>
                            <TabsTrigger value="prescriptions">
                                <Pill className="h-4 w-4 mr-2" />
                                Prescriptions
                            </TabsTrigger>
                            <TabsTrigger value="procedures">
                                <Stethoscope className="h-4 w-4 mr-2" />
                                Procedures
                            </TabsTrigger>
                            <TabsTrigger value="records">
                                <FileText className="h-4 w-4 mr-2" />
                                Medical Records
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="vaccinations">
                            {healthData?.vaccinations && healthData.vaccinations.length > 0 ? (
                                <div className="space-y-4">
                                    {healthData.vaccinations.map((vax) => (
                                        <Card key={vax.id}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">
                                                    {vax.vaccine_name || "Unknown Vaccine"}
                                                </CardTitle>
                                                <CardDescription>
                                                    Administered on {formatDate(vax.administered_date)}
                                                    {vax.veterinarians?.users &&
                                                        ` by Dr. ${vax.veterinarians.users.first_name} ${vax.veterinarians.users.last_name}`}
                                                </CardDescription>
                                            </CardHeader>
                                            {vax.batch_number && (
                                                <CardContent className="pt-0">
                                                    <p className="text-sm text-muted-foreground">
                                                        Batch: {vax.batch_number}
                                                    </p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Syringe />} message="No vaccination history found" />
                            )}
                        </TabsContent>

                        <TabsContent value="prescriptions">
                            {healthData?.prescriptions && healthData.prescriptions.length > 0 ? (
                                <div className="space-y-4">
                                    {healthData.prescriptions.map((rx) => (
                                        <Card key={rx.id}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">
                                                    {rx.medications?.name || rx.medication_name || "Prescription"}
                                                </CardTitle>
                                                <CardDescription>
                                                    {rx.dosage} • {rx.frequency}
                                                    {rx.veterinarians?.users &&
                                                        ` • Prescribed by Dr. ${rx.veterinarians.users.first_name} ${rx.veterinarians.users.last_name}`}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm">
                                                        <span className="font-medium">Start date:</span>{" "}
                                                        {formatDate(rx.start_date)}
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">End date:</span>{" "}
                                                        {formatDate(rx.end_date)}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Pill />} message="No prescription history found" />
                            )}
                        </TabsContent>

                        <TabsContent value="procedures">
                            {healthData?.healthcareProcedures && healthData.healthcareProcedures.length > 0 ? (
                                <div className="space-y-4">
                                    {healthData.healthcareProcedures.map((proc) => (
                                        <Card key={proc.id}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">
                                                    {toTitleCase(proc.procedure_type.replace(/_/g, " "))}
                                                </CardTitle>
                                                <CardDescription>
                                                    Performed on {formatDate(proc.procedure_date)}
                                                    {proc.veterinarians?.users &&
                                                        ` by Dr. ${proc.veterinarians.users.first_name} ${proc.veterinarians.users.last_name}`}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                {(proc.product_used || proc.dosage) && (
                                                    <div className="mb-2">
                                                        {proc.product_used && (
                                                            <p className="text-sm">
                                                                <span className="font-medium">Product:</span>{" "}
                                                                {proc.product_used}
                                                            </p>
                                                        )}
                                                        {proc.dosage && (
                                                            <p className="text-sm">
                                                                <span className="font-medium">Dosage:</span>{" "}
                                                                {proc.dosage}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {proc.notes && (
                                                    <>
                                                        <Separator className="my-2" />
                                                        <p className="text-sm">
                                                            <span className="font-medium">Notes:</span> {proc.notes}
                                                        </p>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Stethoscope />} message="No procedure history found" />
                            )}
                        </TabsContent>

                        <TabsContent value="records">
                            {healthData?.medicalRecords && healthData.medicalRecords.length > 0 ? (
                                <div className="space-y-4">
                                    {healthData.medicalRecords.map((record) => (
                                        <Card key={record.id}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">
                                                    {record.diagnosis || "Medical Visit"}
                                                </CardTitle>
                                                <CardDescription>
                                                    Visit on {formatDate(record.visit_date)}
                                                    {record.veterinarians?.users &&
                                                        ` with Dr. ${record.veterinarians.users.first_name} ${record.veterinarians.users.last_name}`}
                                                </CardDescription>
                                            </CardHeader>
                                            {record.notes && (
                                                <CardContent className="pt-0">
                                                    <p className="text-sm">
                                                        <span className="font-medium">Notes:</span> {record.notes}
                                                    </p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<FileText />} message="No medical records found" />
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
    return (
        <div className="py-10 flex flex-col items-center justify-center text-center border rounded-lg bg-muted/20">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                {icon || <AlertCircle className="h-6 w-6" />}
            </div>
            <h3 className="font-medium">{message}</h3>
            <p className="text-sm text-muted-foreground mt-1">Healthcare information will appear here when available</p>
        </div>
    );
}
