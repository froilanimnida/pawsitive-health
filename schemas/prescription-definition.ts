import { z } from "zod";

export const PrescriptionDefinition = z.object({
    dosage: z.string(),
    frequency: z.string(),
    start_date: z.date(),
    end_date: z.date(),
    refills_remaining: z.number(),
    pet_uuid: z.string().uuid({
        message: "Invalid pet UUID",
    }),
    pet_id: z.number(),
});

export type PrescriptionType = z.infer<typeof PrescriptionDefinition>;
