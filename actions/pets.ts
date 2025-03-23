'use server';

import type { PetSchema } from '@/lib/pet-definition';
import {
	PrismaClient,
	type breed_type,
	type pet_sex_type,
	type species_type,
} from '@prisma/client';
import { z } from 'zod';

export const AddPet = async (values: z.infer<typeof PetSchema>) => {
	const prisma = new PrismaClient();
	const pet = await prisma.pets.create({
		data: {
			name: values.name,
			breed: values.breed as breed_type,
			sex: values.sex as pet_sex_type,
			species: values.species as species_type,
			date_of_birth: values.date_of_birth,
			weight_kg: values.weight_kg,
			medical_history: values.medical_history,
			vaccination_status: values.vaccination_status,
		},
	});
	if (!pet) {
		throw new Error('Failed to add pet');
	}
	return pet;
};

export const GetPet = async (pet_id: number) => {
	const prisma = new PrismaClient();
	const pet = await prisma.pets.findUnique({
		where: {
			pet_id: pet_id,
		},
	});
	if (!pet) {
		throw new Error('Pet not found');
	}
	return pet;
};

export const UpdatePet = async (
	values: z.infer<typeof PetSchema>,
	pet_id: number,
) => {
	const prisma = new PrismaClient();
	const pet = await prisma.pets.update({
		where: {
			pet_id: pet_id,
		},
		data: {
			name: values.name,
			breed: values.breed as breed_type,
			sex: values.sex as pet_sex_type,
			species: values.species as species_type,
			weight_kg: values.weight_kg,
			medical_history: values.medical_history,
			vaccination_status: values.vaccination_status,
		},
	});
	if (!pet) {
		throw new Error('Failed to update pet');
	}
	return pet;
};
