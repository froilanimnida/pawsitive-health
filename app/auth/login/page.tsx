'use client';

import React, { type FormEventHandler } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ResponsiveContainer from '@/components/shared/layout/responsive-container';
import { useForm } from 'react-hook-form';
import { LoginSchema } from '@/lib/auth-definitions';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

const LoginPage = () => {
	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		progressive: true,
	});
	const handleLogin = async (e: FormEventHandler) => {
		const email = form.getValues('email') as string;
		const password = form.getValues('password') as string;
		toast.loading('Logging in...');
		const data = LoginSchema.safeParse(form.getValues());
		const d = await signIn('credentials', { email, password });
		console.log(d);
	};
	return (
		<ResponsiveContainer className='flex justify-center items-center'>
			<>
				<section className='flex justify-center items-center max-w-1/2 mx-auto'></section>

				<Card>
					<CardHeader>
						<CardTitle>Hello There!</CardTitle>
						<CardDescription>Login to continue</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<FormControl>
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormField
										name='email'
										render={({
											field,
											fieldState,
											formState,
										}) => (
											<Input
												type='text'
												placeholder='Email'
												className='mb-4'
												{...field}
											/>
										)}
									/>
								</FormItem>
							</FormControl>
							<FormControl>
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormField
										name='password'
										render={({
											field,
											fieldState,
											formState,
										}) => (
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
						</Form>
					</CardContent>
					<CardFooter className='flex flex-col gap-4'>
						<Button type='submit'>Login</Button>
						<Link href={'/auth/sign-up'}>Sign up instead</Link>
					</CardFooter>
				</Card>
			</>
		</ResponsiveContainer>
	);
};

export default LoginPage;
