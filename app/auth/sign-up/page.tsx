import React from 'react';
import { Metadata } from 'next';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
	title: 'PawsitiveHealth | SignUp',
	description: 'PawsitiveHealth is a pet health care service.',
};

const SignUp = () => {
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Sign Up</CardTitle>
					<CardDescription>
						Sign up to access the full features of the app
					</CardDescription>
				</CardHeader>
				<CardContent></CardContent>
				<CardFooter>
					<p>Sign Up</p>
				</CardFooter>
			</Card>
		</>
	);
};
export default SignUp;
