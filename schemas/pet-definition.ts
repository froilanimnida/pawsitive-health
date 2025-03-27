import { z } from 'zod';
import { breed_type } from "@prisma/client";
import { pet_sex_type } from "@prisma/client";

const BREEDS = Object.values(breed_type) as [string, ...string[]];
const PET_SEX_TYPE = Object.values(pet_sex_type) as [string, ...string[]];

export const PetSchema = z.object({
	name: z.string().min(1).max(50),
	sex: z.enum(PET_SEX_TYPE),
	species: z.string().min(1).max(50),
	breed: z.enum(BREEDS),
	date_of_birth: z.date(),
	weight_kg: z.number(),
	medical_history: z.string(),
	vaccination_status: z.string(),
});
