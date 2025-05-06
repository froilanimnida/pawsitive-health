import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/shared/logo";
import ForgotPasswordForm from "@/components/form/forgot-password-form";
export default function ForgotPasswordPage() {
    return (
        <div className="w-full flex h-screen flex-col items-center justify-center bg-yellow-50">
            <div className="flex items-center justify-center gap-4 mb-4">
                <Logo />
            </div>
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
                    <CardDescription>Enter your email address to receive a password reset link</CardDescription>
                </CardHeader>

                <CardContent>
                    <ForgotPasswordForm />
                </CardContent>

                <CardFooter>
                    <div className="flex w-full flex-col space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t"></span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-2 text-sm">
                            <Link
                                href="/signin"
                                className="flex items-center text-sm text-muted-foreground hover:text-primary"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
