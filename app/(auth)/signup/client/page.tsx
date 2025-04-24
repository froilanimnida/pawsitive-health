"use client";
import MaxWidthContainer from "@/components/shared/layout/max-width-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import ClientSignUpForm from "@/components/form/clinic-form";

function ClientSignUp() {
    return (
        <MaxWidthContainer>
            <Card>
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Create new clinic account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ClientSignUpForm />
                </CardContent>
            </Card>
        </MaxWidthContainer>
    );
}

export default ClientSignUp;
