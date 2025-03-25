import React from 'react';
import { notFound } from 'next/navigation';
import { getPet } from '@/actions/pets';
import { Metadata } from 'next';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'PawsitiveHealth | Pet Details',
	description: 'Pet details page',
};

async function PetDetails({ params }: { params: { uuid: string } }) {
	const uuid = params.uuid;
	if (!uuid) {
		notFound();
	}

	const pet = await getPet(uuid);

	if (!pet) {
		notFound();
	}

	return (
		<div className='container mx-auto p-6'>
			<Card className='w-full'>
				<CardHeader>
					<CardTitle className='text-2xl'>{pet.name}</CardTitle>
					<CardDescription>
						{pet.species} • {pet.breed?.replace(/_/g, ' ')}
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-4'>
							<h3 className='text-lg font-semibold'>
								Pet Information
							</h3>
							<div className='grid grid-cols-2 gap-2'>
								<div className='text-sm font-medium text-muted-foreground'>
									Species
								</div>
								<div>{pet.species}</div>

								<div className='text-sm font-medium text-muted-foreground'>
									Breed
								</div>
								<div>{pet.breed?.replace(/_/g, ' ')}</div>

								<div className='text-sm font-medium text-muted-foreground'>
									Sex
								</div>
								<div>{pet.sex}</div>

								{pet.date_of_birth && (
									<>
										<div className='text-sm font-medium text-muted-foreground'>
											Date of Birth
										</div>
										<div>
											{new Date(
												pet.date_of_birth,
											).toLocaleDateString()}
										</div>
									</>
								)}

								<div className='text-sm font-medium text-muted-foreground'>
									Weight
								</div>
								<div>{pet.weight_kg?.toString()} kg</div>
							</div>
						</div>

						<div className='space-y-4'>
							<h3 className='text-lg font-semibold'>
								Medical Information
							</h3>
							<div className='space-y-3'>
								<div>
									<div className='text-sm font-medium text-muted-foreground'>
										Vaccination Status
									</div>
									<div className='mt-1'>
										{pet.vaccination_status || 'Unknown'}
									</div>
								</div>

								<div>
									<div className='text-sm font-medium text-muted-foreground'>
										Medical History
									</div>
									<div className='mt-1 text-sm'>
										{pet.medical_history ||
											'No medical history available'}
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>

				<CardFooter className='flex justify-between'>
					<Button variant='outline'>Edit Pet</Button>
					<Button variant='default'>Schedule Appointment</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export default PetDetails;
