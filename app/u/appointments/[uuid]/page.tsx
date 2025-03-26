import { getPets } from '@/actions/pets';
import AppointmentForm from '@/components/form/appointment-form';
import React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

const NewAppointment = async ({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) => {
	const { uuid } = await params;
	const pets = await getPets();
	return (
		<Card>
			<CardHeader>
				<CardTitle>New Appointment</CardTitle>
				<CardDescription>Book a new appointment</CardDescription>
			</CardHeader>
			<CardContent>
				<AppointmentForm params={{ uuid, pets }} />
			</CardContent>
		</Card>
	);
};

export default NewAppointment;
