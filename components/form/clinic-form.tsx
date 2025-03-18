'use client';
import React from 'react';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NewClinicAccountSchema } from '@/lib/clinic-signup-definition';
import { Checkbox } from '../ui/checkbox';

function ClinicSignUp() {
	const clinicSignUpFields: {
		label: string;
		placeholder: string;
		name:
			| 'name'
			| 'address'
			| 'city'
			| 'state'
			| 'postal_code'
			| 'phone_number'
			| 'first_name'
			| 'last_name'
			| 'email'
			| 'password'
			| 'confirm_password';

		description: string;
	}[] = [
		{
			label: 'Clinic Name',
			placeholder: 'Clinic Name',
			name: 'name',
			description: 'The name of your clinic.',
		},
		{
			label: 'Address',
			placeholder: 'Address',
			name: 'address',
			description: 'The address of your clinic.',
		},
		{
			label: 'City',
			placeholder: 'City',
			name: 'city',
			description: 'The city where your clinic is located.',
		},
		{
			label: 'State',
			placeholder: 'State',
			name: 'state',
			description: 'The state where your clinic is located.',
		},
		{
			label: 'Postal Code',
			placeholder: 'Postal Code',
			name: 'postal_code',
			description: 'The postal code of your clinic.',
		},
		{
			label: 'Phone Number',
			placeholder: 'Phone Number',
			name: 'phone_number',
			description: 'The phone number of your clinic.',
		},
		{
			label: 'First Name',
			placeholder: 'First Name',
			name: 'first_name',
			description: 'The first name of the clinic owner.',
		},
		{
			label: 'Last Name',
			placeholder: 'Last Name',
			name: 'last_name',
			description: 'The last name of the clinic owner.',
		},
		{
			label: 'Email',
			placeholder: 'Email',
			name: 'email',
			description: 'The email of the clinic owner.',
		},
		{
			label: 'Password',
			placeholder: 'Password',
			name: 'password',
			description: 'The password of the clinic owner.',
		},
		{
			label: 'Confirm Password',
			placeholder: 'Confirm Password',
			name: 'confirm_password',
			description: 'Confirm the password of the clinic owner.',
		},
	];
	const clinicSignUpForm = useForm({
		defaultValues: {
			name: '',
			address: '',
			city: '',
			state: '',
			postal_code: '',
			phone_number: '',
			emergency_services: false,
			first_name: '',
			last_name: '',
			email: '',
			password: '',
			confirm_password: '',
		},
		resolver: zodResolver(NewClinicAccountSchema),
		progressive: true,
	});
	const onSubmit = (values: z.infer<typeof NewClinicAccountSchema>) => {
		console.log(values);
	};
	return (
		<Form {...clinicSignUpForm}>
			<form onSubmit={clinicSignUpForm.handleSubmit(onSubmit)}>
				{clinicSignUpFields.map((clinicSignUpField) => (
					<FormField
						key={clinicSignUpField.name}
						control={clinicSignUpForm.control}
						name={clinicSignUpField.name}
						render={({ field, fieldState }) => (
							<FormItem className='mb-5'>
								<FormLabel>{clinicSignUpField.label}</FormLabel>
								<FormControl>
									<Input
										type={
											clinicSignUpField.name.includes(
												'password',
											)
												? 'password'
												: 'text'
										}
										placeholder={
											clinicSignUpField.placeholder
										}
										{...field}
									/>
								</FormControl>
								<FormDescription>
									{clinicSignUpField.description}
								</FormDescription>
								<FormMessage className='text-red-500'>
									{fieldState.error?.message}
								</FormMessage>
							</FormItem>
						)}
					/>
				))}
				<FormField
					name='emergency_services'
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Emergency Services</FormLabel>
							<FormControl>
								<Checkbox {...field} />
							</FormControl>
							<FormDescription>
								Do you provide emergency services?
							</FormDescription>
							<FormMessage className='text-red-500'>
								{fieldState.error?.message}
							</FormMessage>
						</FormItem>
					)}
				/>
				<Button type='submit'>Sign Up</Button>
			</form>
		</Form>
	);
}

export default ClinicSignUp;
