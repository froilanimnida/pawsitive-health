"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import type { PrescriptionData } from "@/types";

interface PetPrescriptionsTableProps {
    prescriptions: PrescriptionData[];
}

const columns: ColumnDef<PrescriptionData>[] = [
    {
        accessorKey: "medications",
        header: "Medication",
        cell: ({ row }) => {
            const medication = row.original.medications;
            return <div>{medication ? medication.name : "Unknown"}</div>;
        },
    },
    {
        accessorKey: "dosage",
        header: "Dosage",
        cell: ({ row }) => {
            const dosage = row.getValue("dosage") as string;
            return <div>{dosage}</div>;
        },
    },
    {
        accessorKey: "frequency",
        header: "Frequency",
        cell: ({ row }) => {
            const frequency = row.getValue("frequency") as string;
            return <div>{frequency}</div>;
        },
    },
    {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }) => {
            const date = row.getValue("start_date") as Date;
            return date ? <div>{format(new Date(date), "PPP")}</div> : <div>-</div>;
        },
    },
    {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) => {
            const date = row.getValue("end_date") as Date;
            return date ? <div>{format(new Date(date), "PPP")}</div> : <div>-</div>;
        },
    },
    {
        accessorKey: "refills_remaining",
        header: "Refills",
        cell: ({ row }) => {
            const refills = row.getValue("refills_remaining") as number;
            return <div>{refills !== null ? refills : "-"}</div>;
        },
    },
    {
        accessorKey: "veterinarians",
        header: "Prescribed By",
        cell: ({ row }) => {
            const vet = row.original.veterinarians;
            return (
                <div>{vet && vet.users ? `Dr. ${vet.users.first_name} ${vet.users.last_name}` : "Not specified"}</div>
            );
        },
    },
];

export function PetPrescriptionsTable({ prescriptions }: PetPrescriptionsTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Prescriptions</h2>
            </div>
            <DataTable columns={columns} data={prescriptions} />
        </div>
    );
}
