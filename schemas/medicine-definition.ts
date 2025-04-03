import { z } from "zod";

export const MedicineSchema = z.object({
    name: z.string().nonempty({ message: "Name is required" }),
    description: z.string().nonempty({ message: "Description is required" }),
    usage_instructions: z.string().nonempty({ message: "Usage instructions are required" }),
    side_effects: z.string().nonempty({ message: "Side effects are required" }),
});

export type MedicineType = z.infer<typeof MedicineSchema>;
