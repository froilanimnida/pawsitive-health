"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { Syringe, Pill, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, isPast } from "date-fns";
import { UpcomingVaccination, UpcomingPrescription } from "@/types/actions";

export function UpcomingHealthcareDashboard({
    vaccinations,
    prescriptions,
}: {
    vaccinations: UpcomingVaccination[] | [];
    prescriptions: UpcomingPrescription[] | [];
}) {
    // Helper function to get status badge
    const getDueDateStatus = (dueDate: Date | string | null) => {
        if (!dueDate) return null;

        const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        if (isPast(date)) {
            return {
                label: "Overdue",
                variant: "destructive" as const,
                className: "bg-red-100 text-red-800 hover:bg-red-200",
            };
        } else if (date <= sevenDaysFromNow) {
            return {
                label: "Soon",
                variant: "warning" as const,
                className: "bg-amber-100 text-amber-800 hover:bg-amber-200",
            };
        } else {
            return {
                label: "Upcoming",
                variant: "outline" as const,
                className: "bg-green-100 text-green-800 hover:bg-green-200",
            };
        }
    };

    return (
        <section className="grid gap-4 xl:grid-cols-2 grid-cols-1">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center">
                            <Syringe className="h-5 w-5 mr-2 text-green-600" />
                            Upcoming Vaccinations
                        </CardTitle>
                        <CardDescription>Stay on top of your pet&apos;s vaccination schedule</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/user/pets" className="flex items-center gap-1">
                            View All <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {vaccinations.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No upcoming vaccinations. All your pets are up to date!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {vaccinations.map((vax) => {
                                const status = getDueDateStatus(vax.next_due_date);
                                const formattedDate = vax.next_due_date
                                    ? formatDistanceToNow(new Date(vax.next_due_date), { addSuffix: true })
                                    : "No date set";

                                return (
                                    <div
                                        key={vax.vaccination_id}
                                        className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {vax.pets?.name}: {vax.vaccine_name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Due {formattedDate}</div>
                                        </div>
                                        {status && <Badge className={status.className}>{status.label}</Badge>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center">
                            <Pill className="h-5 w-5 mr-2 text-purple-600" />
                            Medications & Prescriptions
                        </CardTitle>
                        <CardDescription>Track your pet&apos;s medication schedule</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/user/pets" className="flex items-center gap-1">
                            View All <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {prescriptions.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No current prescriptions for your pets
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {prescriptions.map((rx) => {
                                const status = getDueDateStatus(rx.end_date);
                                const formattedDate = rx.end_date
                                    ? formatDistanceToNow(new Date(rx.end_date), { addSuffix: true })
                                    : "No end date";

                                return (
                                    <div
                                        key={rx.prescription_id}
                                        className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {rx.pets?.name}: {rx.medications?.name || "Medication"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Ends {formattedDate}{" "}
                                                {rx.refills_remaining ? `(${rx.refills_remaining} refills left)` : ""}
                                            </div>
                                        </div>
                                        {status && <Badge className={status.className}>{status.label}</Badge>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
