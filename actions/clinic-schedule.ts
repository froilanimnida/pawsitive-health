import { PrismaClient } from '@prisma/client';

const getClinicSchedule = async (clinic_id: string) => {
	try {
		const prisma = new PrismaClient();
		const clinicSchedule = await prisma.clinic_hours.findMany({
			where: {
				clinic_id: Number(clinic_id),
			},
		});
		return Promise.resolve(clinicSchedule);
	} catch (error) {
		console.error(error);
		return Promise.reject(error);
	}
};

export { getClinicSchedule };
