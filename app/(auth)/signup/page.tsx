import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import UserSignUpForm from "@/components/form/user-sign-up-form";
import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Sign Up",
    description: "Create your account",
};

const SignUp = () => {
    return (
        <div className="flex justify-center flex-col items-center p-5 gap-5 w-full h-screen bg-yellow-50">
            <div className="flex items-center justify-center gap-4">
                <Logo />
            </div>
            <Card className="max-w-[768px] bg-white rounded-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Sign Up</CardTitle>
                    <CardDescription>Sign up to access the full features of the app</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserSignUpForm />
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-2">
                    <Button asChild variant="outline" className="w-full">
                        <Link href={"/signin"} className="text-sm">
                            Login instead
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={"/signup/client"} className="text-sm">
                            Create clinic account
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
};
export default SignUp;
