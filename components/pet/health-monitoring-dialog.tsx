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
import { useState } from "react";
import { HealthMonitoringForm } from "../form/health-monitoring-form";
import { Activity } from "lucide-react";

interface HealthMonitoringDialogProps {
    petId: number;
    petUuid: string;
    petName: string;
    triggerButton?: React.ReactNode;
}

export const HealthMonitoringDialog = ({ petId, petUuid, petName, triggerButton }: HealthMonitoringDialogProps) => {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

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
                        onSuccess={handleSuccess}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
