import { z } from "zod";
import { procedure_type } from "@prisma/client";

export const ProcedureSchema = z.object({
    procedure_type: z.enum(Object.values(procedure_type) as [string, ...string[]]),
    procedure_date: z.date().optional(),
    next_due_date: z.date().optional(),
    product_used: z.string().max(100).optional(),
    dosage: z.string().max(50).optional(),
    notes: z.string().optional()
});

export const PetHealthcareSchema = z.object({
    vaccinations: z.array(z.object({
        vaccine_name: z.string().min(1).max(100),
        administered_date: z.date().optional(),
        next_due_date: z.date().optional(),
        batch_number: z.string().optional()
    })).optional(),
    procedures: z.array(ProcedureSchema).optional()
});
