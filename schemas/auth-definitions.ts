import { toTitleCase } from "@/lib";
import { z } from "zod";

export const SignUpSchema = z
    .object({
        first_name: z
            .string()
            .nonempty({
                message: "First name is required",
            })
            .max(255)
            .transform((name) => toTitleCase(name)),
        last_name: z
            .string()
            .nonempty({
                message: "Last name is required",
            })
            .max(255)
            .transform((name) => toTitleCase(name)),
        email: z
            .string()
            .email({
                message: "Please enter a valid email",
            })
            .max(255)
            .transform((email) => email.toLowerCase()),
        password: z
            .string()
            .nonempty({
                message: "Password is required",
            })
            .max(255)
            .min(8, { message: "Password must be 8 characters long." }),
        confirm_password: z
            .string()
            .nonempty({
                message: "Confirm password is required",
            })
            .max(255)
            .min(8, { message: "Password must be 8 characters long." }),
        phone_number: z
            .string()
            .nonempty({ message: "Phone number is required" })
            .regex(/^\+?[0-9]{1,15}$/),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    });

export const LoginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }).nonempty().max(255),
    password: z.string().min(8, { message: "Password must be 8 characters long." }).max(255).nonempty(),
});

export const OtpSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, { message: "OTP must be a 6-digit number." }),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }).nonempty().max(255),
});

export const ResetPasswordSchema = z
    .object({
        token: z.string(),
        password: z
            .string()
            .min(8, { message: "New password must be at least 8 characters long." })
            .max(255)
            .refine(
                (password) => {
                    // Password strength validation
                    const hasLowerCase = /[a-z]/.test(password);
                    const hasUpperCase = /[A-Z]/.test(password);
                    const hasNumber = /\d/.test(password);
                    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

                    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;
                },
                {
                    message: "Password must contain lowercase, uppercase, number and special character",
                },
            ),
        confirm_password: z.string().min(1, { message: "Confirm your new password." }).max(255),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    });

export const PasswordChangeSchema = z
    .object({
        current_password: z.string().min(1, { message: "Current password is required." }).max(255),
        new_password: z
            .string()
            .min(8, { message: "New password must be at least 8 characters long." })
            .max(255)
            .refine(
                (password) => {
                    // Password strength validation
                    const hasLowerCase = /[a-z]/.test(password);
                    const hasUpperCase = /[A-Z]/.test(password);
                    const hasNumber = /\d/.test(password);
                    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

                    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;
                },
                {
                    message: "Password must contain lowercase, uppercase, number and special character",
                },
            ),
        confirm_password: z.string().min(1, { message: "Confirm your new password." }).max(255),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    })
    .refine((data) => data.current_password !== data.new_password, {
        message: "New password must be different from current password",
        path: ["new_password"],
    });

export type SignUpType = z.infer<typeof SignUpSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type OtpType = z.infer<typeof OtpSchema>;
export type PasswordChangeType = z.infer<typeof PasswordChangeSchema>;
export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;
