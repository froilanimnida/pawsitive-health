import { z } from 'zod';
import { appointment_type } from '@prisma/client';
import { appointment_status } from '@prisma/client';

const appointment_type_array = Object.values(appointment_type) as [
	string,
	...string[],
];

const appointment_status_array = Object.values(appointment_status) as [
	string,
	...string[],
];

export const AppointmentSchema = z.object({
	pet_uuid: z.string(),
	vet_id: z.string(),
	clinic_id: z.string(),
	appointment_date: z.date(),
	appointment_type: z.enum(appointment_type_array),
	notes: z.string(),
	status: z.enum(appointment_status_array),
});
