"use client";
import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginType, OtpSchema } from "@/schemas";
import { toast } from "sonner";
import { TextFormField } from "@/types/forms/text-form-field";
import { useRouter } from "next/navigation";
import { loginAccount, verifyOTPToken } from "@/actions";

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

    const handleOtp = async (values: { otp: string }) => {
        setIsOtpLoading(true);
        toast.promise(verifyOTPToken(email, values.otp), {
            loading: "Verifying OTP...",
            success: (data) => {
                if (data.success && data.data?.correct) {
                    setShowOtpDialog(false);
                    return "OTP verified successfully!";
                } else {
                    throw new Error("Invalid OTP code");
                }
            },
            error: (error) => {
                setIsOtpLoading(false);
                return error.message || "Failed to verify OTP";
            },
        });

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
            toast.success("Signed in successfully");
            if (session.user.role === "client") router.push("/c");
            else if (session.user.role === "veterinarian") router.push("/v");
            else if (session.user.role === "admin") router.push("/a");
            else if (session.user.role === "user") router.push("/u");
            else router.push("/");
        } else toast.error("Failed to retrieve user role");
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
