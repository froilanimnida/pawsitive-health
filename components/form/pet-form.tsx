'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
	FormItem,
	Form,
	FormControl,
	FormField,
	FormLabel,
	FormMessage,
	FormDescription,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Breeds } from '@/lib/types/breed-types';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { PetSchema } from '@/lib/pet-definition';
import { zodResolver } from '@hookform/resolvers/zod';

const breedsArray = Object.values(Breeds);

const AddPetForm = () => {
	const [date, setDate] = useState<Date | undefined>(undefined);

	const form = useForm({
		shouldFocusError: true,
		defaultValues: {
			name: '',
			species: '',
			breed: '',
			weight: '',
			sex: '',
			medical_history: '',
			vaccination_status: '',
			date_of_birth: undefined,
		},
		progressive: true,
		resolver: zodResolver(PetSchema),
	});

	const textFields = [
		{
			name: 'name',
			label: 'Name',
			placeholder: 'Name',
			description: 'Enter your pet name',
			type: 'text',
		},
		{
			name: 'weight',
			label: 'Weight (kg)',
			placeholder: 'Weight',
			description: "Enter your pet's weight in kilograms",
			type: 'number',
		},
		{
			name: 'medical_history',
			label: 'Medical History',
			placeholder: 'Medical history',
			description: "Enter your pet's medical history",
		},
		{
			name: 'vaccination_status',
			label: 'Vaccination Status',
			placeholder: 'Vaccination status',
			description: "Enter your pet's vaccination status",
		},
	];

	const selectFields = [
		{
			name: 'species',
			label: 'Species',
			placeholder: 'Species',
			options: [
				{ value: 'dog', label: 'Dog' },
				{ value: 'cat', label: 'Cat' },
			],
			description: 'Select the species of your pet',
		},
		{
			name: 'breed',
			label: 'Breed',
			placeholder: 'Breed',
			description: 'Select the breed of your pet',
			options: breedsArray.map((breed) => ({
				value: breed,
				label: breed.replaceAll('_', ' ').toLocaleUpperCase(),
			})),
		},
		{
			name: 'sex',
			label: 'Sex',
			placeholder: 'Sex',
			description: 'Select the sex of your pet',
			options: [
				{ value: 'male', label: 'Male' },
				{ value: 'female', label: 'Female' },
				{ value: 'prefer_not_to_say', label: 'Prefer not to say' },
			],
		},
	];

	const onSubmit = (data: FormData) => {
		const formData = {
			...data,
			date_of_birth: date,
		};
		console.log('Form submitted:', formData);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-4'>
				{textFields.map((field) => (
					<FormField
						key={field.name}
						control={form.control}
						name={
							field.name as
								| 'name'
								| 'weight'
								| 'medical_history'
								| 'vaccination_status'
						}
						render={({ field: formField }) => (
							<FormItem>
								<FormLabel>{field.label}</FormLabel>
								<FormControl>
									<Input
										{...formField}
										type={field.type || 'text'}
										placeholder={field.placeholder}
									/>
								</FormControl>
								<FormDescription>
									{field.description}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}

				{/* Render select fields */}
				{selectFields.map((field) => (
					<FormField
						key={field.name}
						control={form.control}
						name={field.name}
						render={({ field: formField }) => (
							<FormItem>
								<FormLabel>{field.label}</FormLabel>
								<Select
									onValueChange={formField.onChange}
									defaultValue={formField.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue
												placeholder={field.placeholder}
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{field.options.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									{field.description}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
				<FormField
					control={form.control}
					name='date_of_birth'
					render={() => (
						<FormItem>
							<FormLabel>Date of Birth</FormLabel>
							<FormControl>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant='outline'
											className={cn(
												'w-full justify-start text-left font-normal',
												!date &&
													'text-muted-foreground',
											)}>
											<CalendarIcon className='mr-2 h-4 w-4' />
											{date ?
												format(date, 'PPP')
											:	<span>Pick a date</span>}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0'>
										<Calendar
											mode='single'
											selected={date}
											onSelect={setDate}
											initialFocus
											className='bg-white'
										/>
									</PopoverContent>
								</Popover>
							</FormControl>
							<FormDescription>
								Enter your pet&apos;s date of birth
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type='submit'
					className='mt-6'>
					Add Pet
				</Button>
			</form>
		</Form>
	);
};

export default AddPetForm;
