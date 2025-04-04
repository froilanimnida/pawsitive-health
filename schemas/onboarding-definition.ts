import { z } from "zod";
import { PetSchema } from "./pet-definition";
import { PetHealthcareSchema } from "./procedure-definition";

export const OnboardingPetSchema = PetSchema.extend({
    healthcare: PetHealthcareSchema.optional(),
});

export type PetOnboardingSchema = z.infer<typeof OnboardingPetSchema>;
