import React from 'react';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
	CardContent,
} from '@/components/ui/card';
import { Metadata } from 'next';
import NewVeterinaryForm from '@/components/form/new-vet-form';

export const metadata: Metadata = {
	title: 'Pawsitive | Add Veterinary',
	description: 'Add a new veterinary',
};

function AddVeterinary() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Veterinary</CardTitle>
				<CardDescription>Add a new veterinary</CardDescription>
			</CardHeader>
			<CardContent>
				<NewVeterinaryForm />
			</CardContent>
		</Card>
	);
}

export default AddVeterinary;
