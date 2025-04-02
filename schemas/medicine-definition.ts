import { z } from "zod";

export const MedicineSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  usage_instructions: z.string().nonempty(),
  side_effects: z.string().nonempty()
})