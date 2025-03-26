import React, { Suspense } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import AppointmentForm from '@/components/form/appointment-form';
import type { Metadata } from 'next';
import { getUserAppointments } from '@/actions/appointment';

export const metadata: Metadata = {
	title: 'PawsitiveHealth | Appointments',
	description: 'PawsitiveHealth is a pet health care service.',
};

const AppointmentsHistory = async () => {
	const appointments = await getUserAppointments();
	if (!appointments || appointments.length === 0) {
		return (
			<div className='text-center py-10 w-full mx-auto'>
				<h3 className='text-lg font-medium'>No appointments found</h3>
				<p className='text-muted-foreground'>
					Add your first appointment to get started
				</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4'>
			{appointments.map((appointment) => (
				<Card key={appointment.appointment_id}>
					<CardHeader>
						<CardTitle>{appointment.pets?.name}</CardTitle>
						<CardDescription>
							{appointment.veterinarians?.users?.first_name}{' '}
							{appointment.veterinarians?.users?.last_name}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex flex-col space-y-2'>
							<div>
								<span className='font-semibold'>Date:</span>{' '}
								{appointment.appointment_date.toDateString()}
							</div>
							<div>
								<span className='font-semibold'>Type:</span>{' '}
								{appointment.appointment_type}
							</div>
							<div>
								<span className='font-semibold'>Status:</span>{' '}
								{appointment.status}
							</div>
							<div>
								<span className='font-semibold'>Notes:</span>{' '}
								{appointment.notes}
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button>Manage</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
};

function Appointments() {
	return (
		<section className='p-4 w-full min-h-screen'>
			<Suspense fallback={<SkeletonCard />}>
				<AppointmentsHistory />
			</Suspense>
			<Dialog>
				<DialogTrigger asChild>
					<Button>New Appointment</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Appointment</DialogTitle>
						<DialogDescription>
							Add new clinic appointment, select a pet and a
							veterinarian and other details.
						</DialogDescription>
					</DialogHeader>
					<AppointmentForm />
				</DialogContent>
			</Dialog>
		</section>
	);
}

export default Appointments;
