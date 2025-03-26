import { getPets } from '@/actions/pets';
import AppointmentForm from '@/components/form/appointment-form';
import React from 'react';

const NewAppointment = async ({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) => {
	const { uuid } = await params;
	const pets = await getPets();
	return (
		<div>
			<AppointmentForm params={{ uuid, pets }} />
		</div>
	);
};

export default NewAppointment;
