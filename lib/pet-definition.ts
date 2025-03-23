import { z } from 'zod';
import { Breeds } from './types/breed-types';
import { PetSexType } from './types/constants';

const BREEDS = Object.values(Breeds) as [string, ...string[]];
const PET_SEX_TYPE = Object.values(PetSexType) as [string, ...string[]];

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
