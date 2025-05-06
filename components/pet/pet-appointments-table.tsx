"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { toTitleCase } from "@/lib";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AppointmentData {
    appointment_id: number;
    appointment_date: Date;
    appointment_type: string;
    status: string;
    notes?: string | null;
    clinic?: { name: string } | null;
    veterinarians?: {
        users: {
            first_name: string;
            last_name: string;
        };
    } | null;
}

interface PetAppointmentsTableProps {
    appointments: AppointmentData[];
}

const columns: ColumnDef<AppointmentData>[] = [
    {
        accessorKey: "appointment_date",
        header: "Date",
        cell: ({ row }) => {
            const date = row.getValue("appointment_date") as Date;
            return <div>{format(new Date(date), "PPP")}</div>;
        },
    },
    {
        accessorKey: "appointment_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("appointment_type") as string;
            return <div>{toTitleCase(type.replace(/_/g, " "))}</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const getStatusColor = (status: string) => {
                switch (status) {
                    case "confirmed":
                        return "bg-green-100 text-green-800";
                    case "requested":
                        return "bg-blue-100 text-blue-800";
                    case "completed":
                        return "bg-gray-100 text-gray-800";
                    case "cancelled":
                        return "bg-red-100 text-red-800";
                    case "no_show":
                        return "bg-yellow-100 text-yellow-800";
                    case "checked_in":
                        return "bg-purple-100 text-purple-800";
                    default:
                        return "bg-gray-100 text-gray-800";
                }
            };

            return (
                <Badge className={getStatusColor(status)} variant="outline">
                    {toTitleCase(status.replace(/_/g, " "))}
                </Badge>
            );
        },
    },
    {
        accessorKey: "veterinarians",
        header: "Veterinarian",
        cell: ({ row }) => {
            const vet = row.original.veterinarians;
            return <div>{vet ? `Dr. ${vet.users.first_name} ${vet.users.last_name}` : "Not assigned"}</div>;
        },
    },
    {
        accessorKey: "clinic",
        header: "Clinic",
        cell: ({ row }) => {
            const clinic = row.original.clinic;
            return <div>{clinic ? clinic.name : "Not specified"}</div>;
        },
    },
    {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => {
            const notes = row.original.notes;
            return <div title={notes || ""}>{notes || "No notes"}</div>;
        },
    },
];

export function PetAppointmentsTable({ appointments }: PetAppointmentsTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Appointments</h2>
            </div>
            <DataTable columns={columns} data={appointments} />
        </div>
    );
}
