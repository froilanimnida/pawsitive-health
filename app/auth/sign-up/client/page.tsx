import React from 'react';
import MaxWidthContainer from '@/components/shared/layout/max-width-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClientSignUpForm from '@/components/form/clinic-form';

function ClientSignUp() {
	return (
		<MaxWidthContainer>
			<Card>
				<CardHeader>
					<CardTitle>Sign Up</CardTitle>
				</CardHeader>
				<CardContent>
					<ClientSignUpForm />
				</CardContent>
			</Card>
		</MaxWidthContainer>
	);
}

export default ClientSignUp;
