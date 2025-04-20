"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface VaccinationData {
    vaccination_id: number;
    vaccine_name: string | null;
    administered_date: Date | null;
    next_due_date: Date | null;
    batch_number: string | null;
    veterinarians?: {
        users: {
            first_name: string;
            last_name: string;
        };
    } | null;
}

interface PetVaccinationsTableProps {
    vaccinations: VaccinationData[];
}

const columns: ColumnDef<VaccinationData>[] = [
    {
        accessorKey: "vaccine_name",
        header: "Vaccine",
        cell: ({ row }) => {
            const name = row.getValue("vaccine_name") as string;
            return <div>{name}</div>;
        },
    },
    {
        accessorKey: "administered_date",
        header: "Administered On",
        cell: ({ row }) => {
            const date = row.getValue("administered_date") as Date;
            return date ? <div>{format(new Date(date), "PPP")}</div> : <div>-</div>;
        },
    },
    {
        accessorKey: "next_due_date",
        header: "Next Due Date",
        cell: ({ row }) => {
            const date = row.getValue("next_due_date") as Date;
            if (!date) return <div>-</div>;

            const now = new Date();
            const dueDate = new Date(date);
            const isPastDue = dueDate < now;

            return (
                <div className="flex items-center gap-2">
                    <div>{format(dueDate, "PPP")}</div>
                    {isPastDue && (
                        <Badge variant="destructive" className="ml-2">
                            Overdue
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "batch_number",
        header: "Batch No.",
        cell: ({ row }) => {
            const batchNumber = row.getValue("batch_number") as string;
            return <div>{batchNumber || "-"}</div>;
        },
    },
    {
        accessorKey: "veterinarians",
        header: "Administered By",
        cell: ({ row }) => {
            const vet = row.original.veterinarians;
            return <div>{vet ? `Dr. ${vet.users.first_name} ${vet.users.last_name}` : "Not specified"}</div>;
        },
    },
];

export function PetVaccinationsTable({ vaccinations }: PetVaccinationsTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Vaccinations</h2>
            </div>
            <DataTable columns={columns} data={vaccinations} />
        </div>
    );
}
