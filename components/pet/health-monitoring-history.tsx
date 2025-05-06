"use client";

import { Button } from "@/components/ui";
import { format } from "date-fns";
import { Activity, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteHealthMonitoringRecord } from "@/actions";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { health_monitoring } from "@prisma/client";
import type { Modify } from "@/types";
export function HealthMonitoringHistory({
    healthRecords,
    petUuid,
    onDelete,
}: {
    healthRecords: Modify<health_monitoring, { temperature_celsius: string; weight_kg: string }>[];
    petUuid: string;
    onDelete?: () => void;
}) {
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
            very_low: "bg-red-100 text-red-800",
            low: "bg-amber-100 text-amber-800",
            normal: "bg-green-100 text-green-800",
            high: "bg-blue-100 text-blue-800",
            very_high: "bg-purple-100 text-purple-800",
        };
        return colorMap[level] || "bg-slate-100 text-slate-800";
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

    const columns: ColumnDef<Modify<health_monitoring, { temperature_celsius: string; weight_kg: string }>>[] = [
        {
            accessorKey: "recorded_at",
            header: "Date",
            cell: ({ row }) => {
                const date = row.getValue("recorded_at") as Date;
                return <div>{format(new Date(date), "PPP")}</div>;
            },
        },
        {
            accessorKey: "activity_level",
            header: "Activity Level",
            cell: ({ row }) => {
                const level = row.getValue("activity_level") as string;
                return (
                    <Badge className={getActivityLevelColor(level)} variant="outline">
                        {formatActivityLevel(level)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "weight_kg",
            header: "Weight (kg)",
            cell: ({ row }) => {
                const weight = row.getValue("weight_kg") as string;
                return <div>{weight}</div>;
            },
        },
        {
            accessorKey: "temperature_celsius",
            header: "Temperature (°C)",
            cell: ({ row }) => {
                const temperature = row.getValue("temperature_celsius") as string;
                return <div>{temperature}</div>;
            },
        },
        {
            accessorKey: "notes",
            header: "Notes",
            cell: ({ row }) => {
                const notes = row.original.notes;
                const symptoms = row.original.symptoms;
                return (
                    <div>
                        {symptoms && <div className="font-medium mb-1">Symptoms: {symptoms}</div>}
                        {notes}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const monitoringId = row.original.monitoring_id;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(monitoringId)}
                        disabled={isDeleting === monitoringId}
                    >
                        {isDeleting === monitoringId ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                        <span className="sr-only">Delete</span>
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Health Records</h2>
            <DataTable columns={columns} data={healthRecords} pageSize={5} showPagination={true} />
        </div>
    );
}
