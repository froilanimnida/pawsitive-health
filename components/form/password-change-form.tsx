"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui";
import { changePassword, confirmPasswordChange } from "@/actions";
import { PasswordChangeSchema, type PasswordChangeType, OtpSchema } from "@/schemas";
import { LockIcon, CheckCircle2, AlertCircle } from "lucide-react";

export default function PasswordChangeForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [isOtpLoading, setIsOtpLoading] = useState(false);
    const [pendingPasswordData, setPendingPasswordData] = useState<string | null>(null);
    const { data: session } = useSession();

    const passwordChangeForm = useForm<PasswordChangeType>({
        resolver: zodResolver(PasswordChangeSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
        mode: "onBlur",
    });

    const otpForm = useForm({
        resolver: zodResolver(OtpSchema),
        defaultValues: {
            otp: "",
        },
        shouldFocusError: true,
    });

    const onPasswordChangeSubmit = async (values: PasswordChangeType) => {
        if (!session?.user?.id) {
            toast.error("You must be logged in to change your password");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await changePassword(values, Number(session.user.id));

            if (result === undefined) {
                toast.success("Verification code sent to your email");
                setPendingPasswordData(values.new_password);
                setShowOtpDialog(true);
            } else {
                toast.error((result && !result.success && result.error) || "Failed to process password change");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onOtpSubmit = async (values: { otp: string }) => {
        if (!session?.user?.id || !pendingPasswordData) {
            toast.error("Missing required information");
            return;
        }

        setIsOtpLoading(true);

        try {
            const result = await confirmPasswordChange(values.otp, pendingPasswordData, Number(session.user.id));

            if (result === undefined) {
                toast.success("Password changed successfully");
                setShowOtpDialog(false);
                passwordChangeForm.reset();
                otpForm.reset();
                setPendingPasswordData(null);
            } else {
                toast.error((result && !result.success && result.error) || "Failed to verify OTP");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsOtpLoading(false);
        }
    };

    // Password strength indicators
    const newPassword = passwordChangeForm.watch("new_password");
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;

    return (
        <>
            <Form {...passwordChangeForm}>
                <form onSubmit={passwordChangeForm.handleSubmit(onPasswordChangeSubmit)} className="space-y-6">
                    <FormField
                        control={passwordChangeForm.control}
                        name="current_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter your current password"
                                        {...field}
                                        disabled={isSubmitting}
                                        autoComplete="current-password"
                                    />
                                </FormControl>
                                <FormDescription>Your current account password</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={passwordChangeForm.control}
                        name="new_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter your new password"
                                        {...field}
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                    />
                                </FormControl>
                                <div className="text-muted-foreground text-sm space-y-1 mt-2">
                                    <div className="text-sm font-medium">Password requirements:</div>
                                    <ul className="text-xs space-y-1">
                                        <li className="flex items-center gap-1.5">
                                            {isLongEnough ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                            )}
                                            <span>At least 8 characters long</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {hasLowerCase ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                            )}
                                            <span>Contains lowercase letters</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {hasUpperCase ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                            )}
                                            <span>Contains uppercase letters</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {hasNumber ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                            )}
                                            <span>Contains numbers</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {hasSpecialChar ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                            )}
                                            <span>Contains special characters</span>
                                        </li>
                                    </ul>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={passwordChangeForm.control}
                        name="confirm_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Confirm your new password"
                                        {...field}
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Processing..." : "Change Password"}
                    </Button>
                </form>
            </Form>

            <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <LockIcon className="h-5 w-5 text-blue-500" />
                            <span>Verify Password Change</span>
                        </DialogTitle>
                        <DialogDescription>
                            Please enter the 6-digit verification code sent to your email to confirm your password
                            change.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter 6-digit code"
                                                maxLength={6}
                                                disabled={isOtpLoading}
                                            />
                                        </FormControl>
                                        <FormDescription>The code is valid for 5 minutes.</FormDescription>
                                        <FormMessage>{fieldState.error?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="gap-2 sm:justify-between">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setShowOtpDialog(false)}
                                    disabled={isOtpLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isOtpLoading}>
                                    {isOtpLoading ? "Verifying..." : "Confirm Password Change"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
