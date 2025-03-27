import { PrismaClient } from '@prisma/client';

export const getClinics = async () => {
	try {
		const prisma = new PrismaClient();
		const clinics = await prisma.clinics.findMany();
		return Promise.resolve(clinics);
	} catch (error) {
		console.error(error);
		return Promise.reject(error);
	}
};

export const getNearbyClinics = async (latitude: number, longitude: number) => {
	try {
		const prisma = new PrismaClient();
		const clinics = await prisma.clinics.findMany({
			where: {
				latitude: {
					lt: latitude + 1,
					gt: latitude - 1,
				},
				longitude: {
					lt: longitude + 1,
					gt: longitude - 1,
				},
			},
		});
		return Promise.resolve(clinics);
	} catch (error) {
		console.error(error);
		return Promise.reject(error);
	}
};
