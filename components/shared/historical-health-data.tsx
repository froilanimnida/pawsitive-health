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
import { History, Pill, Syringe, Stethoscope, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getPetHistoricalHealthcareData } from "@/actions/dashboard-healthcare";
import { toTitleCase } from "@/lib/functions/text/title-case";

interface HistoricalHealthDataProps {
    petId: number;
    petName: string;
}

export function HistoricalHealthData({ petId, petName }: HistoricalHealthDataProps) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [healthData, setHealthData] = useState<{
        vaccinations: {
            id: number;
            vaccine_name: string | null;
            administered_date: Date | null;
            batch_number: string | null;
        }[];
        prescriptions: {
            id: number;
            medication_name: string;
            dosage: string;
            frequency: string;
            start_date: Date | null;
            end_date: Date | null;
        }[];
        procedures: {
            id: number;
            procedure_type: string;
            procedure_date: Date | null;
            product_used: string | null;
            dosage: string | null;
            notes: string | null;
        }[];
    } | null>(null);

    useEffect(() => {
        if (isOpen && !healthData) {
            loadHealthData();
        }
    }, [isOpen]);

    const loadHealthData = async () => {
        setLoading(true);
        try {
            const response = await getPetHistoricalHealthcareData(petId);
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
                        View past vaccinations, prescriptions, and healthcare procedures
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 text-center">
                        <p className="text-muted-foreground">Loading health history...</p>
                    </div>
                ) : (
                    <Tabs defaultValue="vaccinations" className="mt-4">
                        <TabsList className="grid grid-cols-3 mb-4">
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
                                                <CardTitle className="text-base">{rx.medication_name}</CardTitle>
                                                <CardDescription>
                                                    {rx.dosage} • {rx.frequency}
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
                            {healthData?.procedures && healthData.procedures.length > 0 ? (
                                <div className="space-y-4">
                                    {healthData.procedures.map((proc) => (
                                        <Card key={proc.id}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">
                                                    {toTitleCase(proc.procedure_type.replace(/_/g, " "))}
                                                </CardTitle>
                                                <CardDescription>
                                                    Performed on {formatDate(proc.procedure_date)}
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
