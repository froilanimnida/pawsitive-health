import { verifyEmail } from "@/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Verify Email | PawsitiveHealth",
    description: "Verify your email address to complete registration",
};

const VerifyEmail = async ({ params }: { params: { token: string } }) => {
    const { token } = await params;
    const result = await verifyEmail(token);

    const isError = result && "error" in result;

    return (
        <div className="flex items-center justify-center min-h-screen w-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
                    <CardDescription>We&apos;re verifying your email address</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                    {isError ? (
                        <div className="flex flex-col items-center text-center space-y-2">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <h3 className="font-medium text-lg">Verification Failed</h3>
                            <p className="text-sm text-muted-foreground">{result.error}</p>
                            <p className="text-sm">Please try again or contact support for help.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center space-y-2">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <h3 className="font-medium text-lg">Email Verified Successfully</h3>
                            <p className="text-sm">You&apos;ll be redirected to the sign-in page momentarily.</p>
                            <p className="text-sm text-muted-foreground">
                                If you&apos;re not redirected,{" "}
                                <Link href="/signin" className="underline text-primary">
                                    click here
                                </Link>
                                .
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmail;
