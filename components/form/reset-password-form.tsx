"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ResetPasswordSchema, type ResetPasswordType } from "@/schemas";
import { resetPassword } from "@/actions";
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@/components/ui";
import { createFormConfig } from "@/lib";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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

    // Redirect to forgot password if no token is provided
    if (!token) {
        toast.error("No reset token found. Please request a new password reset link.");
        router.push("/forgot-password");
        return null;
    }

    const onSubmit = async (values: ResetPasswordType) => {
        setIsSubmitting(true);

        try {
            const result = await resetPassword(values);

            if (result.success) {
                setIsSuccess(true);
                form.reset();
                toast.success("Password reset successful!");

                // Redirect to sign in page after 3 seconds
                setTimeout(() => {
                    router.push("/signin");
                }, 3000);
            } else {
                toast.error(result.error || "Failed to reset password");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error("Password reset error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-center text-sm">
                    Your password has been reset successfully. You will be redirected to the sign-in page.
                </p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="••••••••"
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

                <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="••••••••"
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
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
            </form>
        </Form>
    );
}
