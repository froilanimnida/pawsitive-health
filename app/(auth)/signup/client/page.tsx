"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import ClientSignUpForm from "@/components/form/clinic-form";
import Logo from "@/components/shared/logo";

function ClientSignUp() {
    return (
        <div className="flex justify-center flex-col items-center p-5 gap-5 w-full bg-yellow-50">
            <div className="flex items-center justify-center gap-4">
                <Logo />
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Sign Up</CardTitle>
                    <CardDescription>Create new clinic account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ClientSignUpForm />
                </CardContent>
            </Card>
        </div>
    );
}

export default ClientSignUp;
