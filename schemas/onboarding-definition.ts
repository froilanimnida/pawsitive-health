import { z } from "zod";
import { PetSchema } from "./pet-definition";
import { PetHealthcareSchema } from "./procedure-definition";

export const ComprehensivePetSchema = PetSchema.extend({
  healthcare: PetHealthcareSchema.optional()
});

export type ComprehensivePet = z.infer<typeof ComprehensivePetSchema>;
