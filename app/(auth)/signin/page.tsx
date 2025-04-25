import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Metadata } from "next";
import Link from "next/link";
import ResponsiveContainer from "@/components/shared/layout/responsive-container";
import UserLoginForm from "@/components/form/user-login-form";
import { Suspense } from "react";
import { SkeletonCard } from "@/components/ui";

export const metadata: Metadata = {
    title: "Pawsitive | Login",
    description: "Login to your account",
};

const LoginPage = async () => {
    return (
        <ResponsiveContainer className="flex justify-center items-center">
            <Suspense fallback={<SkeletonCard />}>
                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Login to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserLoginForm />
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href={"/signup"} className="text-sm">
                            Sign up instead
                        </Link>
                    </CardFooter>
                </Card>
            </Suspense>
        </ResponsiveContainer>
    );
};

export default LoginPage;
