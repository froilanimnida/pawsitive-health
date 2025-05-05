"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ResetPasswordSchema, type ResetPasswordType } from "@/schemas";
import { resetPassword } from "@/actions";
import {
    Button,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Alert,
} from "@/components/ui";
import { createFormConfig } from "@/lib";
import { CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tokenError, setTokenError] = useState("");

    // Get token from URL query parameter
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setTokenError("Missing reset token. Please request a new password reset link.");
        }
    }, [token]);

    const form = useForm<ResetPasswordType>(
        createFormConfig({
            resolver: zodResolver(ResetPasswordSchema),
            defaultValues: {
                token: token || "",
                password: "",
                confirm_password: "",
            },
        }),
    );

    const onSubmit = async (values: ResetPasswordType) => {
        if (!token) {
            setTokenError("Missing reset token. Please request a new password reset link.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await resetPassword({
                ...values,
                token,
            });

            if (result.success) {
                setIsSuccess(true);
                form.reset();
                // Redirect to signin page after 3 seconds
                setTimeout(() => {
                    router.push("/signin");
                }, 3000);
            } else {
                toast.error(result.error || "Failed to reset password");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Password strength indicators
    const password = form.watch("password");
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
                    <CardDescription>
                        {!isSuccess
                            ? "Create a new password for your account"
                            : "Your password has been reset successfully"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {tokenError ? (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <div className="ml-2">
                                <p>{tokenError}</p>
                                <Link href="/forgot-password" className="font-medium underline mt-2 block">
                                    Return to forgot password
                                </Link>
                            </div>
                        </Alert>
                    ) : isSuccess ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-center text-sm text-gray-600">
                                Your password has been reset successfully. You will be redirected to the sign in page in
                                a few seconds.
                            </p>
                            <Button variant="outline" className="mt-4" onClick={() => router.push("/signin")}>
                                Go to sign in
                            </Button>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your new password"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <div className="mt-2 space-y-1">
                                                <div className="text-sm font-medium">Password requirements:</div>
                                                <ul className="text-xs space-y-1 text-muted-foreground">
                                                    <li className={isLongEnough ? "text-green-600" : ""}>
                                                        {isLongEnough ? "✓" : "○"} At least 8 characters
                                                    </li>
                                                    <li className={hasLowerCase ? "text-green-600" : ""}>
                                                        {hasLowerCase ? "✓" : "○"} At least one lowercase letter
                                                    </li>
                                                    <li className={hasUpperCase ? "text-green-600" : ""}>
                                                        {hasUpperCase ? "✓" : "○"} At least one uppercase letter
                                                    </li>
                                                    <li className={hasNumber ? "text-green-600" : ""}>
                                                        {hasNumber ? "✓" : "○"} At least one number
                                                    </li>
                                                    <li className={hasSpecialChar ? "text-green-600" : ""}>
                                                        {hasSpecialChar ? "✓" : "○"} At least one special character
                                                    </li>
                                                </ul>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirm_password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Confirm your new password"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Reset Password"}
                                </Button>
                            </form>
                        </Form>
                    )}
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
