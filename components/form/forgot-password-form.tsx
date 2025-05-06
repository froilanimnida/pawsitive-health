"use client";
import { forgotPassword } from "@/actions";
import { createFormConfig } from "@/lib";
import { type ForgotPasswordType, ForgotPasswordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    Input,
    FormDescription,
    FormMessage,
    Button,
    Form,
} from "@/components/ui";

function ForgotPasswordForm() {
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
        <div>
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
                        If an account with that email exists, we&apos;ve sent a password reset link. Please check your
                        inbox and follow the instructions to reset your password.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsSubmitted(false)}>
                        Return to reset password
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ForgotPasswordForm;
