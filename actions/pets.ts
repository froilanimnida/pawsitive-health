'use server';
import { auth } from '@/auth';
import type { PetSchema } from '@/lib/pet-definition';
import {
	PrismaClient,
	type breed_type,
	type pet_sex_type,
	type species_type,
} from '@prisma/client';
import { z } from 'zod';
import { getUserId } from './user';

const addPet = async (values: z.infer<typeof PetSchema>) => {
	const session = await auth();
	if (!session || !session.user || !session.user.email) {
		throw new Error('User not found');
	}
	const user_id = await getUserId(session?.user?.email);
	try {
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
				user_id: user_id,
			},
		});
		if (!pet) {
			throw Promise.reject('Failed to add pet');
		}
		return { success: true };
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		if (typeof error === 'string') {
			throw new Error(error);
		}
		throw new Error('An unexpected error occurred');
	}
};

const getPet = async (pet_uuid: string) => {
	const prisma = new PrismaClient();
	const pet = await prisma.pets.findUnique({
		where: {
			pet_uuid: pet_uuid,
		},
	});
	if (!pet) {
		throw new Error('Pet not found');
	}
	return pet;
};

const updatePet = async (values: z.infer<typeof PetSchema>, pet_id: number) => {
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

const getPets = async () => {
	const prisma = new PrismaClient();
	const session = await auth();
	if (!session || !session.user || !session.user.email) {
		throw new Error('User not found');
	}
	const userId = await getUserId(session?.user?.email);
	const pets = await prisma.pets.findMany({
		where: {
			user_id: userId,
		},
	});
	if (!pets) {
		throw new Error('No pets found');
	}
	return pets;
};

export { addPet, getPet, updatePet, getPets };
