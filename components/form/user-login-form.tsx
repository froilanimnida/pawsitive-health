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
// import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/lib/auth-definitions';
import { z } from 'zod';

function UserLoginForm() {
	const loginFormFields: {
		label: string;
		placeholder: string;
		name: 'email' | 'password';
		description: string;
	}[] = [
		{
			label: 'Email',
			placeholder: 'Email',
			name: 'email',
			description: 'The email you use when you register an account.',
		},
		{
			label: 'Password',
			placeholder: 'Password',
			name: 'password',
			description: 'The password you use when you register an account.',
		},
	];
	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		progressive: true,
		resolver: zodResolver(LoginSchema),
		shouldFocusError: true,
		mode: 'onBlur',
	});

	const onSubmit = (values: z.infer<typeof LoginSchema>) => {
		alert('Form submitted');
		console.log(values);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-8'>
				{loginFormFields.map((loginField) => (
					<FormField
						key={loginField.name}
						control={form.control}
						name={loginField.name}
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>{loginField.label}</FormLabel>
								<FormControl>
									<Input
										type='text'
										placeholder={loginField.placeholder}
										{...field}
									/>
								</FormControl>
								<FormDescription>
									{loginField.description}
								</FormDescription>
								<FormMessage>
									{fieldState.error?.message}
								</FormMessage>
							</FormItem>
						)}
					/>
				))}
				<Button
					className='w-full'
					type='submit'>
					Login
				</Button>
			</form>
		</Form>
	);
}

export default UserLoginForm;
