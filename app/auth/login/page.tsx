import React from 'react';
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from '@/components/ui/card';

import Link from 'next/link';
import ResponsiveContainer from '@/components/shared/layout/responsive-container';
import UserLoginForm from '@/components/form/user-login-form';

const LoginPage = () => {
	return (
		<ResponsiveContainer className='flex justify-center items-center'>
			<Card>
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>Login to continue</CardDescription>
				</CardHeader>
				<CardContent className='space-y-8'>
					<UserLoginForm />
				</CardContent>
				<CardFooter className='flex flex-col gap-4'>
					<Link href={'/auth/sign-up'}>Sign up instead</Link>
				</CardFooter>
			</Card>
		</ResponsiveContainer>
	);
};

export default LoginPage;
