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
import type { z } from 'zod';

const breedsArray = Object.values(Breeds);

const AddPetForm = () => {
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [selectedBreed, setSelectedBreed] = useState<string | undefined>(
		undefined,
	);
	const [selectedSpecies, setSelectedSpecies] = useState<string>('dog');

	const form = useForm({
		shouldFocusError: true,
		defaultValues: {
			name: '',
			species: 'dog',
			breed: '',
			weight_kg: 0,
			sex: 'prefer-not-to-say',
			medical_history: '',
			vaccination_status: '',
			date_of_birth: undefined,
		},
		progressive: true,
		resolver: zodResolver(PetSchema),
	});

	const textFields: {
		name:
			| 'name'
			| 'species'
			| 'breed'
			| 'sex'
			| 'medical_history'
			| 'vaccination_status'
			| 'weight_kg';
		label: string;
		placeholder: string;
		description: string;
		type: string;
	}[] = [
		{
			name: 'name',
			label: 'Name',
			placeholder: 'Name',
			description: 'Enter your pet name',
			type: 'text',
		},
		{
			name: 'weight_kg',
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
			type: 'text',
		},
		{
			name: 'vaccination_status',
			label: 'Vaccination Status',
			placeholder: 'Vaccination status',
			description: "Enter your pet's vaccination status",
			type: 'text',
		},
	];

	const selectFields: {
		name: 'species' | 'breed' | 'sex';
		label: string;
		placeholder: string;
		description: string;
		options: { value: string; label: string }[];
		defaultValue?: string;
		onChange?: (value: string) => void;
	}[] = [
		{
			name: 'species',
			label: 'Species',
			placeholder: 'Species',
			options: [
				{ value: 'dog', label: 'Dog' },
				{ value: 'cat', label: 'Cat' },
			],
			description: 'Select the species of your pet',
			defaultValue: selectedSpecies,
			onChange: (value) => {
				setSelectedSpecies(value);
				form.setValue('breed', '');
			},
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
			defaultValue: selectedBreed,
			onChange: (value) => {
				setSelectedBreed(value);
			},
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

	const onSubmit = (values: z.infer<typeof PetSchema>) => {
		console.log('Form submitted:', values);
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
						name={field.name}
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
				<FormField
					name='date_of_birth'
					control={form.control}
					render={({ field }) => (
						<FormItem {...field}>
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
											{date ? (
												format(date, 'PPP')
											) : (
												<span>Pick a date</span>
											)}
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
					)}></FormField>
				{selectFields.map((selectField) => (
					<FormField
						key={selectField.name}
						control={form.control}
						name={selectField.name}
						render={({ field }) => (
							<FormItem {...field}>
								<FormLabel>{selectField.label}</FormLabel>
								<Select
									onValueChange={selectField.onChange}
									defaultValue={selectField.defaultValue}>
									<FormControl>
										<SelectTrigger>
											<SelectValue
												placeholder={
													selectField.placeholder
												}
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{selectField.options.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									{selectField.description}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
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
