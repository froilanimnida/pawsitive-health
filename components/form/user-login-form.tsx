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
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui";
import { NotificationPermissionDialog } from "@/components/shared/notification-permission-dialog";
import { createFormConfig } from "@/lib";
import { notificationSynchronizer } from "@/lib/notification";
import { role_type } from "@prisma/client";
import { ArrowRightCircle } from "lucide-react";
import Link from "next/link";

const UserLoginForm = ({
    role,
    sessionEmail,
    exists = false,
}: {
    role?: role_type;
    sessionEmail?: string;
    exists: boolean;
}) => {
    const [isLoading, setIsLoading] = useState(false);
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

    const otpForm = useForm<{ otp: string }>(
        createFormConfig({
            defaultValues: {
                otp: "",
            },
            resolver: zodResolver(OtpSchema),
        }),
    );

    const loginForm = useForm<LoginType>(
        createFormConfig({
            defaultValues: {
                email: "",
                password: "",
            },
            resolver: zodResolver(LoginSchema),
        }),
    );

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
    const navigateToDashboard = () => {
        if (!role) return;
        switch (role) {
            case role_type.user:
                router.push("/user");
                break;
            case role_type.client:
                router.push("/clinic");
                break;
            case role_type.veterinarian:
                router.push("/vet");
                break;
            case role_type.admin:
                router.push("/admin");
                break;
            default:
                router.push("/");
        }
    };

    const handleOtp = async (values: { otp: string }) => {
        setIsLoading(true);

        try {
            const otpResult = await verifyOTPToken(email, values.otp);

            if (!otpResult.success || !otpResult.data?.correct) {
                toast.error("Invalid OTP code");
                setIsLoading(false);
                return;
            }

            const signInResult = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signInResult?.error) {
                toast.error("Authentication failed: " + signInResult.error);
                setIsLoading(false);
                return;
            }

            toast.success("Successfully signed in!");
            setShowOtpDialog(false);

            // Initialize notification sync if permission is granted
            // This is non-blocking and won't delay the navigation
            const notificationPermission = await Notification.permission;
            if (notificationPermission === "granted") {
                // Sync notifications in background without blocking the login flow
                await notificationSynchronizer.syncAllNotificationsOnLogin();
            }

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
            setIsLoading(false);
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
            {exists && (
                <>
                    <div className="mb-6 p-3 border rounded-lg bg-muted/30 ">
                        <div className="flex flex-row items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                You are already logged in as <strong>{sessionEmail}</strong>.
                            </p>
                            <div className="flex-shrink-0">
                                <Button onClick={navigateToDashboard} variant="outline" className="flex items-center">
                                    <ArrowRightCircle />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                        <span className="relative z-10 bg-background px-2 text-muted-foreground">
                            Or sign in with other account
                        </span>
                    </div>
                </>
            )}
            <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-8">
                    {loginFormFields.map((lf) => (
                        <FormField
                            key={lf.name}
                            control={loginForm.control}
                            name={lf.name as "email" | "password"}
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    {lf.name === "password" ? (
                                        <div className="flex items-center justify-between">
                                            <FormLabel>{lf.label}</FormLabel>
                                            <Link
                                                href={"/forgot-password"}
                                                className="text-sm text-muted-foreground hover:underline underline-offset-4"
                                            >
                                                Forgot your Password?
                                            </Link>
                                        </div>
                                    ) : (
                                        <FormLabel>{lf.label}</FormLabel>
                                    )}
                                    <FormControl>
                                        <Input
                                            type={lf.type}
                                            autoComplete={lf.autoComplete}
                                            placeholder={lf.placeholder}
                                            {...field}
                                            required={lf.required}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>{lf.description}</FormDescription>
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
                    <DialogHeader className="text-center w-full flex flex-col items-center">
                        <DialogTitle>Verify OTP</DialogTitle>
                        <DialogDescription>Please enter the 6-digit OTP sent to your email address.</DialogDescription>
                    </DialogHeader>
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(handleOtp)} className="space-y-8">
                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field, fieldState }) => (
                                    <FormItem className="mx-auto">
                                        <FormLabel className="text-center block mb-2">OTP Code</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field} containerClassName="w-1/2 mx-auto">
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                </InputOTPGroup>
                                                <InputOTPSeparator />
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormDescription className="text-center">
                                            The code is valid for 5 minutes.
                                        </FormDescription>
                                        <FormMessage className="text-center">{fieldState.error?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="flex-row flex justify-center items-center gap-2">
                                <Button type="submit" className="sm:w-auto w-full" disabled={isLoading}>
                                    {isLoading ? "Verifying..." : "Verify"}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="sm:w-auto w-full"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
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
