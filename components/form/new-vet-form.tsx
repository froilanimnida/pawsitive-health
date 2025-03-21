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
} from '../ui/form';

const NewVeterinaryForm = () => {
	const newVetFields = [
		{
			label: 'First Name',
			placeholder: 'First Name',
			name: 'first_name',
			description: 'The first name of the veterinarian.',
		},
		{
			label: 'Last Name',
			placeholder: 'Last Name',
			name: 'last_name',
			description: 'The last name of the veterinarian.',
		},
		{
			label: 'Email',
			placeholder: 'Email',
			name: 'email',
			description: 'The email of the veterinarian.',
		},
		{
			label: 'Phone Number',
			placeholder: 'Phone Number',
			name: 'phone_number',
			description: 'The phone number of the veterinarian.',
		},
		{
			label: 'Password',
			placeholder: 'Password',
			name: 'password',
			description: 'The password of the veterinarian.',
		},
		{
			label: 'Confirm Password',
			placeholder: 'Confirm Password',
			name: 'confirm_password',
			description: 'Confirm the password of the veterinarian.',
		},
		{
			label: 'License Number',
			placeholder: 'License Number',
			name: 'license_number',
			description: 'The license number of the veterinarian.',
		},
	];
	const newVeterinaryForm = useForm({
		resolver: zodResolver(VeterinarianSchema),
		mode: 'onBlur',
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			phone_number: '',
			password: '',
			confirm_password: '',
			license_number: '',
			specialization: '',
		},
	});

	const onSubmit = (values: z.infer<typeof VeterinarianSchema>) => {
		console.log('Values: ', values);
	};
	return (
		<Form {...newVeterinaryForm}>
			<form onSubmit={newVeterinaryForm.handleSubmit(onSubmit)}>
				{newVetFields.map((field) => (
					<FormItem key={field.name}>
						<FormLabel>{field.label}</FormLabel>
						<FormField>
							<Input
								placeholder={field.placeholder}
								name={field.name}
								{...newVeterinaryForm.register(field.name)}
							/>
						</FormField>
						<FormDescription>{field.description}</FormDescription>
						<FormMessage>
							{
								newVeterinaryForm.formState.errors[field.name]
									?.message
							}
						</FormMessage>
					</FormItem>
				))}
				<FormItem>
					<FormLabel>Specialization</FormLabel>
					<FormField>
						<Select
							name='specialization'
							{...newVeterinaryForm.register('specialization')}>
							<SelectTrigger>
								<SelectValue>
									{newVeterinaryForm.getValues(
										'specialization',
									)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Specialization</SelectLabel>
									<SelectItem value='General'>
										General
									</SelectItem>
									<SelectItem value='Surgery'>
										Surgery
									</SelectItem>
									<SelectItem value='Dentistry'>
										Dentistry
									</SelectItem>
									<SelectItem value='Dermatology'>
										Dermatology
									</SelectItem>
									<SelectItem value='Internal Medicine'>
										Internal Medicine
									</SelectItem>
									<SelectItem value='Oncology'>
										Oncology
									</SelectItem>
									<SelectItem value='Ophthalmology'>
										Ophthalmology
									</SelectItem>
									<SelectItem value='Radiology'>
										Radiology
									</SelectItem>
									<SelectItem value='Rehabilitation'>
										Rehabilitation
									</SelectItem>
									<SelectItem value='Behavior'>
										Behavior
									</SelectItem>
									<SelectItem value='Cardiology'>
										Cardiology
									</SelectItem>
									<SelectItem value='Neurology'>
										Neurology
									</SelectItem>
									<SelectItem value='Nutrition'>
										Nutrition
									</SelectItem>
									<SelectItem value='Pathology'>
										Pathology
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</FormField>
					<FormMessage>
						{
							newVeterinaryForm.formState.errors['specialization']
								?.message
						}
					</FormMessage>
				</FormItem>
			</form>
		</Form>
	);
};

export default NewVeterinaryForm;
