import React from 'react';
import { notFound } from 'next/navigation';
import { getPet } from '@/actions/pets';
import { Metadata } from 'next';

// Generate metadata dynamically
export const metadata: Metadata = {
	title: 'PawsitiveHealth | Pet Details',
	description: 'Pet details page',
};

// Server Component with params access
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
			<div className='bg-white shadow-md rounded-lg p-6'>
				<h1 className='text-2xl font-bold mb-4'>{pet.name}</h1>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<h2 className='text-xl font-semibold mb-2'>
							Pet Information
						</h2>
						<div className='space-y-2'>
							<p>
								<span className='font-medium'>Species:</span>{' '}
								{pet.species}
							</p>
							<p>
								<span className='font-medium'>Breed:</span>{' '}
								{pet.breed?.replace(/_/g, ' ')}
							</p>
							<p>
								<span className='font-medium'>Sex:</span>{' '}
								{pet.sex}
							</p>
							{pet.date_of_birth && (
								<p>
									<span className='font-medium'>
										Date of Birth:
									</span>{' '}
									{new Date(
										pet.date_of_birth,
									).toLocaleDateString()}
								</p>
							)}
							<p>
								<span className='font-medium'>Weight:</span>{' '}
								{pet.weight_kg?.toString()} kg
							</p>
						</div>
					</div>

					<div>
						<h2 className='text-xl font-semibold mb-2'>
							Medical Information
						</h2>
						<div className='space-y-2'>
							<p>
								<span className='font-medium'>
									Vaccination Status:
								</span>{' '}
								{pet.vaccination_status || 'Unknown'}
							</p>
							<div>
								<span className='font-medium'>
									Medical History:
								</span>
								<p className='mt-1'>
									{pet.medical_history ||
										'No medical history available'}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PetDetails;
