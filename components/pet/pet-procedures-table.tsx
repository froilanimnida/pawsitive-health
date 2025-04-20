"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { toTitleCase } from "@/lib";

interface ProcedureData {
    procedure_id: number;
    procedure_type: string;
    procedure_date: Date | null;
    next_due_date: Date | null;
    product_used: string | null;
    dosage: string | null;
    notes: string | null;
    veterinarians?: {
        users: {
            first_name: string;
            last_name: string;
        };
    } | null;
}

interface PetProceduresTableProps {
    procedures: ProcedureData[];
}

const columns: ColumnDef<ProcedureData>[] = [
    {
        accessorKey: "procedure_type",
        header: "Procedure",
        cell: ({ row }) => {
            const type = row.getValue("procedure_type") as string;
            return <div>{toTitleCase(type.replace(/_/g, " "))}</div>;
        },
    },
    {
        accessorKey: "procedure_date",
        header: "Date",
        cell: ({ row }) => {
            const date = row.getValue("procedure_date") as Date;
            return date ? <div>{format(new Date(date), "PPP")}</div> : <div>-</div>;
        },
    },
    {
        accessorKey: "next_due_date",
        header: "Next Due Date",
        cell: ({ row }) => {
            const date = row.getValue("next_due_date") as Date;
            return date ? <div>{format(new Date(date), "PPP")}</div> : <div>-</div>;
        },
    },
    {
        accessorKey: "product_used",
        header: "Product Used",
        cell: ({ row }) => {
            const product = row.getValue("product_used") as string;
            return <div>{product || "-"}</div>;
        },
    },
    {
        accessorKey: "dosage",
        header: "Dosage",
        cell: ({ row }) => {
            const dosage = row.getValue("dosage") as string;
            return <div>{dosage || "-"}</div>;
        },
    },
    {
        accessorKey: "veterinarians",
        header: "Performed By",
        cell: ({ row }) => {
            const vet = row.original.veterinarians;
            return <div>{vet ? `Dr. ${vet.users.first_name} ${vet.users.last_name}` : "Not specified"}</div>;
        },
    },
    {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => {
            const notes = row.original.notes;
            return (
                <div className="max-w-[200px] truncate" title={notes || ""}>
                    {notes || "No notes"}
                </div>
            );
        },
    },
];

export function PetProceduresTable({ procedures }: PetProceduresTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Healthcare Procedures</h2>
            </div>
            <DataTable columns={columns} data={procedures} />
        </div>
    );
}
