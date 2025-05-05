"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { ForgotPasswordSchema, type ForgotPasswordType } from "@/schemas";
import { forgotPassword } from "@/actions";
import {
    Button,
    Form,
    FormControl,
    FormDescription,
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
} from "@/components/ui";
import { createFormConfig } from "@/lib";
import { MailIcon, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ForgotPasswordType>(
        createFormConfig({
            resolver: zodResolver(ForgotPasswordSchema),
            defaultValues: {
                email: "",
            },
        }),
    );

    const onSubmit = async (values: ForgotPasswordType) => {
        setIsSubmitting(true);

        try {
            const result = await forgotPassword(values);

            if (result.success) {
                setIsSubmitted(true);
                form.reset();
            } else {
                toast.error(result.error || "Failed to process password reset request");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
                    <CardDescription>
                        {!isSubmitted
                            ? "Enter your email address and we'll send you a link to reset your password."
                            : "Check your email for a password reset link."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!isSubmitted ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="your.email@example.com"
                                                    type="email"
                                                    autoComplete="email"
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the email address you used when you registered
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-4 py-4">
                            <div className="rounded-full bg-blue-100 p-3">
                                <MailIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-center text-sm text-gray-600">
                                If an account with that email exists, we&apos;ve sent a password reset link. Please
                                check your inbox and follow the instructions to reset your password.
                            </p>
                            <Button variant="outline" className="mt-4" onClick={() => setIsSubmitted(false)}>
                                Return to reset password
                            </Button>
                        </div>
                    )}
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
