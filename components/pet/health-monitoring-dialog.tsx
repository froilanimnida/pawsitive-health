"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
} from "@/components/ui";
import { useState, type ReactNode } from "react";
import { HealthMonitoringForm } from "../form/health-monitoring-form";
import { Activity } from "lucide-react";

export const HealthMonitoringDialog = ({
    petId,
    petUuid,
    petName,
    triggerButton,
    petCurrentWeight,
}: {
    petId: number;
    petUuid: string;
    petName: string;
    triggerButton?: ReactNode;
    petCurrentWeight: number;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant="outline" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Log Health Data
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Health Monitoring for {petName}</DialogTitle>
                    <DialogDescription>
                        Record health metrics and observations for tracking your pet&apos;s wellbeing over time.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <HealthMonitoringForm
                        petId={petId}
                        petUuid={petUuid}
                        currentWeight={petCurrentWeight}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
