"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { Activity, BarChart2, ThermometerIcon, Weight, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteHealthMonitoringRecord } from "@/actions";
import { toast } from "sonner";
import type { Decimal } from "@prisma/client/runtime/library";
import { formatDecimal } from "@/lib";

type HealthMonitoringRecord = {
    monitoring_id: number;
    activity_level: string;
    weight_kg: Decimal;
    temperature_celsius: Decimal;
    symptoms: string;
    notes?: string | null;
    recorded_at: Date;
};

interface HealthMonitoringHistoryProps {
    healthRecords: HealthMonitoringRecord[];
    petUuid: string;
    onDelete?: () => void;
}

export function HealthMonitoringHistory({ healthRecords, petUuid, onDelete }: HealthMonitoringHistoryProps) {
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    if (!healthRecords || healthRecords.length === 0) {
        return (
            <div className="text-center py-6">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                <p className="text-muted-foreground mt-2">No health records have been logged for this pet yet.</p>
            </div>
        );
    }

    const formatActivityLevel = (level: string) => {
        return level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const getActivityLevelColor = (level: string) => {
        const colorMap: Record<string, string> = {
            very_low: "text-red-500",
            low: "text-amber-500",
            normal: "text-green-500",
            high: "text-blue-500",
            very_high: "text-purple-500",
        };
        return colorMap[level] || "text-slate-500";
    };

    const handleDelete = async (monitoringId: number) => {
        setIsDeleting(monitoringId);
        try {
            const result = await deleteHealthMonitoringRecord(monitoringId, petUuid);
            if (result && !result.success) {
                toast.error(result.error || "Failed to delete health record");
                return;
            }
            toast.success("Health record deleted successfully");
            if (onDelete) onDelete();
        } catch {
            toast.error("Failed to delete health record");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Health Monitoring History</h3>

            {healthRecords.map((record) => (
                <Card key={record.monitoring_id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base">
                                Health Record - {formatDistanceToNow(new Date(record.recorded_at), { addSuffix: true })}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDelete(record.monitoring_id)}
                                disabled={isDeleting === record.monitoring_id}
                            >
                                {isDeleting === record.monitoring_id ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2">
                                <BarChart2 className={`h-5 w-5 ${getActivityLevelColor(record.activity_level)}`} />
                                <div>
                                    <p className="text-sm font-medium">Activity Level</p>
                                    <p className={`text-sm ${getActivityLevelColor(record.activity_level)}`}>
                                        {formatActivityLevel(record.activity_level)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Weight className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Weight</p>
                                    <p className="text-sm">{formatDecimal(record.weight_kg)} kg</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <ThermometerIcon className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium">Temperature</p>
                                    <p className="text-sm">{formatDecimal(record.temperature_celsius)} °C</p>
                                </div>
                            </div>
                        </div>

                        {record.symptoms && (
                            <div className="mt-3">
                                <p className="text-sm font-medium">Symptoms</p>
                                <p className="text-sm text-slate-600 mt-1">{record.symptoms}</p>
                            </div>
                        )}

                        {record.notes && (
                            <div className="mt-3">
                                <p className="text-sm font-medium">Notes</p>
                                <p className="text-sm text-slate-600 mt-1">{record.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
