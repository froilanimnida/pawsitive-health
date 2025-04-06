import { verifyEmail } from "@/actions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify Email | PawsitiveHealth",
    description: "Verify your email address to complete registration",
};

const VerifyEmail = async ({ params }: { params: Promise<{ token: string }> }) => {
    const { token } = await params;
    await verifyEmail(token);
    return (
        <div className="container flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
                    <CardDescription>We&apos;re verifying your email address</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
};

export default VerifyEmail;
