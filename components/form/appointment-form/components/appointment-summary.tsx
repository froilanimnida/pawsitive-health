import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui";
import { Clock, Calendar, User } from "lucide-react";

interface AppointmentSummaryProps {
    selectedDate?: Date;
    selectedTime?: string;
    selectedVetName?: string;
    selectedPetName?: string;
    selectedClinicName?: string;
    selectedClinicAddress?: string;
}

export function AppointmentSummary({
    selectedDate,
    selectedTime,
    selectedVetName,
    selectedPetName,
    selectedClinicName,
    selectedClinicAddress,
}: AppointmentSummaryProps) {
    if (!selectedDate || !selectedTime) return null;

    return (
        <Card className="bg-muted/50 mt-4">
            <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-2">Appointment Summary</h3>
                <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Date: {format(selectedDate, "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Time: {selectedTime}</span>
                    </div>
                    {selectedVetName && (
                        <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>With: Dr. {selectedVetName}</span>
                        </div>
                    )}
                    {selectedPetName && (
                        <div className="flex items-center">
                            <span className="ml-6">For: {selectedPetName}</span>
                        </div>
                    )}
                    {selectedClinicName && (
                        <div className="flex items-center">
                            <span className="ml-6">At: {selectedClinicName}</span>
                        </div>
                    )}
                    {selectedClinicAddress && (
                        <div className="flex items-center">
                            <span className="ml-6">Address: {selectedClinicAddress}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
