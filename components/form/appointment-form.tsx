'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VeterinarianSchema } from '@/lib/veterinarian-definition';
import React from 'react';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectValue,
	SelectTrigger,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
	FormControl,
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { AppointmentType } from '@/lib/types/constants';
import { AppointmentSchema } from '@/lib/appointment-definition';

function AppointmentForm() {
	const newAppointmentFields: {
		label: string;
		placeholder: string;
		name: 'status' | 'notes';
		description: string;
	}[] = [
		{
			label: 'Status',
			placeholder: 'Status',
			name: 'status',
			description: 'The status of the appointment.',
		},
		{
			label: 'Notes',
			placeholder: 'Notes',
			name: 'notes',
			description: 'The notes of the appointment.',
		},
	];
	const newAppointmentSelectFields: {
		label: string;
		placeholder: string;
		name: 'appointment_type' | 'vet_id' | 'pet_id';
		description: string;
		options: string[];
	}[] = [
		{
			label: 'Appointment Type',
			placeholder: 'Appointment Type',
			name: 'appointment_type',
			description: 'The type of the appointment.',
			options: Object.values(AppointmentType),
		},
		{
			label: 'Veterinarian',
			placeholder: 'Veterinarian',
			name: 'vet_id',
			description: 'The veterinarian of the appointment.',
			options: ['John Doe', 'Jane Doe'],
		},
		{
			label: 'Pet',
			placeholder: 'Pet',
			name: 'pet_id',
			description: 'The pet of the appointment.',
			options: ['Buddy', 'Milo', 'Charlie', 'Max'],
		},
	];
	const newAppointmentForm = useForm({
		defaultValues: {
			status: '',
			notes: '',
			appointment_type: '',
			vet_id: '',
			pet_id: '',
		},
		resolver: zodResolver(AppointmentSchema),
		progressive: true,
		shouldFocusError: true,
	});
	const onSubmit = (values: z.infer<typeof AppointmentSchema>) => {
		console.log(values);
	};
	return (
		<Form {...newAppointmentForm}>
			<form
				onSubmit={newAppointmentForm.handleSubmit(onSubmit)}
				className='space-y-8'>
				{newAppointmentFields.map((newAppointmentField) => {
					return (
						<FormField
							key={newAppointmentField.name}
							control={newAppointmentForm.control}
							name={newAppointmentField.name}
							render={({ field, fieldState }) => {
								return (
									<FormItem>
										<FormLabel>
											{newAppointmentField.label}
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type='text'
												placeholder={
													newAppointmentField.placeholder
												}
											/>
										</FormControl>
										<FormDescription>
											{newAppointmentField.description}
										</FormDescription>
										<FormMessage className='text-red-500'>
											{fieldState.error?.message}
										</FormMessage>
									</FormItem>
								);
							}}
						/>
					);
				})}
				{newAppointmentSelectFields.map((newAppointmentSelectField) => {
					return (
						<FormField
							key={newAppointmentSelectField.name}
							control={newAppointmentForm.control}
							name={newAppointmentSelectField.name}
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>
											{newAppointmentSelectField.label}
										</FormLabel>
										<Select {...field}>
											<SelectTrigger>
												<Button variant='outline'>
													{
														newAppointmentSelectField.placeholder
													}
												</Button>
											</SelectTrigger>
											<SelectContent>
												{newAppointmentSelectField.options.map(
													(option) => {
														return (
															<SelectGroup
																key={option}>
																<SelectLabel>
																	{option}
																</SelectLabel>
																<SelectValue>
																	{option}
																</SelectValue>
															</SelectGroup>
														);
													},
												)}
											</SelectContent>
										</Select>
									</FormItem>
								);
							}}
						/>
					);
				})}
			</form>
		</Form>
	);
}

export default AppointmentForm;
