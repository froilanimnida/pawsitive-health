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
import { CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ClinicSignUpSchema } from '@/lib/clinic-signup-definition';

function ClinicSignUp() {
	const clinicSignUpForm = useForm({
		defaultValues: {
			name: '',
			address: '',
			city: '',
			state: '',
			postal_code: '',
			phone_number: '',
			emergency_services: '',
		},
		resolver: zodResolver(ClinicSignUpSchema),
		progressive: true,
	});
	const onSubmit = (values: z.infer<typeof ClinicSignUpSchema>) => {
		console.log(values);
	};
	return (
		<form>
			<Form {...clinicSignUpForm}>
				<CardContent className='space-y-8'>
					<FormControl>
						<FormItem>
							<FormLabel>Clinic Name</FormLabel>
							<FormField
								control={clinicSignUpForm.control}
								name='name'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='Clinic Name'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								The name of your clinic.
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Address</FormLabel>
							<FormField
								control={clinicSignUpForm.control}
								name='address'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='Address'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								The address of your clinic.
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>City</FormLabel>
							<FormField
								control={clinicSignUpForm.control}
								name='city'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='City'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								The city where your clinic is located.
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>State</FormLabel>
							<FormField
								control={clinicSignUpForm.control}
								name='state'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='State'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								The state where your clinic is located.
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Postal Code</FormLabel>
							<FormField
								control={clinicSignUpForm.control}
								name='postal_code'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='Postal Code'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								The postal code of your clinic.
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Phone Number</FormLabel>
							<FormField
								control={clinicSignUpForm.control}
								name='phone_number'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='Phone Number'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								The phone number of your clinic.
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Emergency Services</FormLabel>
							<FormField
								control={clinicSignUpForm.control}
								name='emergency_services'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='Emergency Services'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								The emergency services your clinic provides.
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
				</CardContent>
			</Form>
			<Button
				className='w-full'
				type='submit'>
				Sign Up
			</Button>
		</form>
	);
}

export default ClinicSignUp;
