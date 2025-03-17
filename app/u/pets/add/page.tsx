import ResponsiveContainer from '@/components/shared/layout/responsive-container';
import React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import AddPetForm from '@/components/form/pet-form';

const AddPets = () => {
	return (
		<ResponsiveContainer>
			<Card>
				<CardHeader>
					<CardTitle>Add a Pet</CardTitle>
					<CardDescription>
						Fill in the details of your pet
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AddPetForm />
				</CardContent>
			</Card>
		</ResponsiveContainer>
	);
};

export default AddPets;
