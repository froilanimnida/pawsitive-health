"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LoginSchema, OtpSchema, type LoginType } from "@/schemas";
import { loginAccount, regenerateOTPToken, verifyOTPToken } from "@/actions";
import { type TextFormField } from "@/types/forms/text-form-field";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from "@/components/ui";
import { NotificationPermissionDialog } from "@/components/shared/notification-permission-dialog";

const UserLoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpLoading, setIsOtpLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [showNotificationDialog, setShowNotificationDialog] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get("next") || "";

    const loginFormFields: TextFormField[] = [
        {
            label: "Email",
            placeholder: "someone@example.com",
            name: "email",
            description: "The email you use when you register an account.",
            required: true,
            autoComplete: "email",
            type: "email",
        },
        {
            label: "Password",
            placeholder: "********",
            name: "password",
            description: "The password you use when you register your account.",
            required: true,
            type: "password",
            autoComplete: "current-password",
        },
    ];

    const otpForm = useForm({
        defaultValues: {
            otp: "",
        },
        resolver: zodResolver(OtpSchema),
        shouldFocusError: true,
    });

    const loginForm = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        resolver: zodResolver(LoginSchema),
        shouldFocusError: true,
    });

    const handleLogin = async (values: LoginType) => {
        setIsLoading(true);
        toast.promise(loginAccount(values), {
            loading: "Logging in...",
            success: (data) => {
                setIsLoading(false);
                if (data.success) {
                    setEmail(values.email);
                    setPassword(values.password);
                    setShowOtpDialog(true);
                    return "OTP has been sent to your email address";
                } else {
                    throw new Error(data.error || "Failed to log in");
                }
            },
            error: (error) => {
                setIsLoading(false);
                return error.message || "An unexpected error occurred";
            },
        });
    };
    useEffect(() => {
        setTimeout(() => {
            if (Notification.permission === "default") {
                setShowNotificationDialog(true);
            }
        }, 1000);
    }, []);

    const handleOtp = async (values: { otp: string }) => {
        setIsOtpLoading(true);

        try {
            const otpResult = await verifyOTPToken(email, values.otp);

            if (!otpResult.success || !otpResult.data?.correct) {
                toast.error("Invalid OTP code");
                setIsOtpLoading(false);
                return;
            }

            const signInResult = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signInResult?.error) {
                toast.error("Authentication failed: " + signInResult.error);
                setIsOtpLoading(false);
                return;
            }

            toast.success("Successfully signed in!");
            setShowOtpDialog(false);

            if (nextUrl) {
                router.push(nextUrl);
            } else {
                const userRole = otpResult.data.role;
                if (userRole) {
                    setTimeout(() => {
                        switch (userRole) {
                            case "user":
                                router.push("/user");
                                break;
                            case "client":
                                router.push("/clinic");
                                break;
                            case "veterinarian":
                                router.push("/vet");
                                break;
                            case "admin":
                                router.push("/admin");
                                break;
                            default:
                                router.push("/");
                        }
                    }, 500);
                } else {
                    const session = await getSession();
                    if (session?.user?.role) {
                        if (session.user.role === "client") router.push("/clinic");
                        else if (session.user.role === "veterinarian") router.push("/vet");
                        else if (session.user.role === "admin") router.push("/admin");
                        else if (session.user.role === "user") router.push("/user");
                        else router.push("/");
                    } else {
                        router.push("/");
                    }
                }
            }
        } catch (error) {
            console.error("OTP handling error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        toast.promise(regenerateOTPToken(email), {
            loading: "Resending OTP...",
            success: (data) => {
                setIsLoading(false);
                if (data.success) {
                    setShowOtpDialog(true);
                    return "OTP has been resent to your email address";
                } else {
                    throw new Error(data.error || "Failed to resend OTP");
                }
            },
            error: (error) => {
                setIsLoading(false);
                return error.message || "An unexpected error occurred";
            },
        });
    };

    return (
        <>
            <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-8">
                    {loginFormFields.map((loginField) => (
                        <FormField
                            key={loginField.name}
                            control={loginForm.control}
                            name={loginField.name as "email" | "password"}
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>{loginField.label}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type={loginField.type}
                                            autoComplete={loginField.autoComplete}
                                            placeholder={loginField.placeholder}
                                            {...field}
                                            required={loginField.required}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>{loginField.description}</FormDescription>
                                    <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button disabled={isLoading} className="w-full" type="submit">
                        {isLoading ? "Signing In..." : "Login"}
                    </Button>
                </form>
            </Form>

            <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify OTP</DialogTitle>
                        <DialogDescription>Please enter the OTP sent to your email address.</DialogDescription>
                    </DialogHeader>
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(handleOtp)} className="space-y-8">
                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>OTP Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                                disabled={isOtpLoading}
                                            />
                                        </FormControl>
                                        <FormDescription>The code is valid for 5 minutes.</FormDescription>
                                        <FormMessage>{fieldState.error?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isOtpLoading}>
                                    {isOtpLoading ? "Verifying..." : "Verify"}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => handleResendOtp()}
                                    disabled={isOtpLoading}
                                >
                                    Resend OTP
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Notification Permission Dialog */}
            <NotificationPermissionDialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog} />
        </>
    );
};

export default UserLoginForm;
