import { z } from 'zod';
import { breed_type } from "@prisma/client";
import { pet_sex_type } from "@prisma/client";

export const PetSchema = z.object({
	name: z.string().min(1).max(50),
	sex: z.enum(Object.values(pet_sex_type) as [string, ...string[]]),
	species: z.string().min(1).max(50),
	breed: z.enum(Object.values(breed_type) as [string, ...string[]]),
	date_of_birth: z.date(),
	weight_kg: z.number(),
});
