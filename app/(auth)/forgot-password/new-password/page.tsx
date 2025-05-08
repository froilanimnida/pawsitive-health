import { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, SkeletonCard } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ResetPasswordForm from "@/components/form/reset-password-form";

export const metadata = {
    title: "PawsitiveHealth | Reset Password",
    description: "PawsitiveHealth is a pet health care service.",
};

export default function ResetPasswordPage() {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-yellow-50">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
                    <CardDescription>Create a new password for your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<SkeletonCard />}>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full justify-center">
                        <Link
                            href="/signin"
                            className="flex items-center text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
