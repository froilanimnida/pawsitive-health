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
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/lib/auth-definitions';
import { z } from 'zod';

function UserLoginForm() {
	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		progressive: true,
		resolver: zodResolver(LoginSchema),
	});

	const onSubmit = (values: z.infer<typeof LoginSchema>) => {
		console.log(values);
	};
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className='space-y-8'>
			<Form {...form}>
				<CardContent className='space-y-8'>
					<FormControl>
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormField
								control={form.control}
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
								The email you use when you register an account.
							</FormDescription>
							<FormMessage />
						</FormItem>
					</FormControl>
					<FormControl>
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormField
								control={form.control}
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
						</FormItem>
					</FormControl>
					<Button
						className='w-full'
						type='submit'>
						Login
					</Button>
				</CardContent>
			</Form>
		</form>
	);
}

export default UserLoginForm;
