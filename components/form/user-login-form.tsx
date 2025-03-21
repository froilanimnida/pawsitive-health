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
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/lib/auth-definitions';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

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

	const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
		toast.promise(
			async () => {
				const result = await signIn('credentials', {
					email: values.email,
					password: values.password,
					callbackUrl: '/',
					redirect: false,
				});
				if (!result?.ok) {
					return Promise.reject();
				}
				console.log('Result: ', result);
				return result;
			},
			{
				loading: 'Signing in...',
				success: 'Successfully signed in',
				error: 'Failed to sign in. Please check your credentials.',
			},
		);
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
								<FormMessage className='text-red-500'>
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
