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
import { SignUpSchema } from '@/lib/auth-definitions';
import { CardContent } from '@/components/ui/card';
import { z } from 'zod';

function UserSignUpForm() {
	const signUpFormField = [
		{
			label: 'First Name',
			placeholder: 'First Name',
			name: 'first_name',
			description: 'Your first name',
		},
		{
			label: 'Last Name',
			placeholder: 'Last Name',
			name: 'last_name',
			description: 'Your Last name',
		},
		{
			label: 'Email',
			placeholder: 'Email',
			name: 'email',
			description: 'Your valid email address',
		},
		{
			label: 'Password',
			placeholder: 'Password',
			name: 'password',
			description: 'Your password',
		},
		{
			label: 'Confirm your password',
			placeholder: 'Confirm Password',
			name: 'confirm_password',
			description: 'Retype your password',
		},
	];
	const signUpForm = useForm({
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			password: '',
			confirm_password: '',
		},
		resolver: zodResolver(SignUpSchema),
	});

	const onSubmit = (values: z.infer<typeof SignUpSchema>) => {
		console.log(values);
	};
	return (
		<CardContent className='space-y-6'>
			<form onSubmit={signUpForm.handleSubmit(onSubmit)}>
				<Form {...signUpForm}>
					{/* <FormControl>
						<FormItem>
							<FormLabel>First Name</FormLabel>
							<FormField
								control={signUpForm.control}
								name='first_name'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='First Name'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>Your first name</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Last Name</FormLabel>
							<FormField
								control={signUpForm.control}
								name='last_name'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='Last Name'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>Your Last name</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormField
								control={signUpForm.control}
								name='email'
								render={({ field, fieldState, formState }) => (
									<Input
										type='text'
										placeholder='Email'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								Your valid email address
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormField
								control={signUpForm.control}
								name='password'
								render={({ field, fieldState, formState }) => (
									<Input
										type='password'
										placeholder='Password'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>Your password</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Confirm your password</FormLabel>
							<FormField
								control={signUpForm.control}
								name='confirm_password'
								render={({ field, fieldState, formState }) => (
									<Input
										type='password'
										placeholder='Confirm Password'
										className='mb-4'
										{...field}
									/>
								)}
							/>
							<FormDescription>
								Retype your password
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl> */}
					{signUpFormField.map((field, index) => (
						<FormControl key={index}>
							<FormItem>
								<FormLabel>{field.label}</FormLabel>
								<FormField
									control={signUpForm.control}
									name={
										field.name as
											| 'first_name'
											| 'last_name'
											| 'email'
											| 'password'
											| 'confirm_password'
									}
									render={({
										field,
										fieldState,
										formState,
									}) => (
										<Input
											type={
												field.name === 'password' ||
												field.name ===
													'confirm_password'
													? 'password'
													: 'text'
											}
											placeholder={
												signUpFormField[index]
													.placeholder
											}
											className='mb-4'
											{...field}
										/>
									)}
								/>
								<FormDescription>
									{field.description}
								</FormDescription>
								<FormMessage />
							</FormItem>
						</FormControl>
					))}
					<Button className='w-full'>Create account</Button>
				</Form>
			</form>
		</CardContent>
	);
}

export default UserSignUpForm;
