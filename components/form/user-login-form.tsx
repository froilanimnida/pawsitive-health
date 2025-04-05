"use client";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginType, OtpSchema } from "@/schemas/auth-definitions";
import toast from "react-hot-toast";
import { TextFormField } from "@/types/forms/text-form-field";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { loginAccount, verifyOTPToken } from "@/actions/auth";

const UserLoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpLoading, setIsOtpLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const router = useRouter();

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
        try {
            const result = await loginAccount(values);

            if (result.success) {
                setEmail(values.email);
                setPassword(values.password);
                setShowOtpDialog(true);
                toast.success("Please verify your one-time password");
            } else {
                toast.error(result.error || "Failed to sign in");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtp = async (values: { otp: string }) => {
        setIsOtpLoading(true);

        try {
            const otpResult = await verifyOTPToken(email, values.otp);

            if (!otpResult.success || !otpResult.data?.correct) {
                toast.error("Invalid OTP code");
                setIsOtpLoading(false);
                return;
            }

            toast.success("OTP verified successfully!");
            setShowOtpDialog(false);
        } catch (error) {
            toast.error("Failed to verify OTP");
            setIsOtpLoading(false);
            return;
        } finally {
            setIsOtpLoading(false);
        }

        const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (signInResult?.error) {
            toast.error("Authentication failed: " + signInResult.error);
            return;
        }

        const session = await getSession();

        if (session?.user?.role) {
            toast.success("Signed in successfully as " + session.user.role);

            await new Promise((resolve) => setTimeout(resolve, 500));

            if (session.user.role === "client") router.push("/c");
            else if (session.user.role === "veterinarian") router.push("/v");
            else if (session.user.role === "admin") router.push("/a");
            else if (session.user.role === "user") router.push("/u");
            else router.push("/");
        } else {
            toast.error("Failed to retrieve user role");
        }
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
                                        <FormLabel>OTP</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Enter OTP"
                                                {...field}
                                                required
                                                disabled={isOtpLoading}
                                            />
                                        </FormControl>
                                        <FormDescription>Enter the OTP sent to your email address.</FormDescription>
                                        <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button disabled={isOtpLoading} type="submit">
                                    {isOtpLoading ? "Verifying..." : "Verify OTP"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserLoginForm;
