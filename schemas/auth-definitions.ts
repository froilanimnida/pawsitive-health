import { z } from "zod";

export const SignUpSchema = z.object({
    first_name: z
        .string()
        .nonempty({
            message: "First name is required",
        })
        .max(255),
    last_name: z
        .string()
        .nonempty({
            message: "Last name is required",
        })
        .max(255),
    email: z
        .string()
        .email({
            message: "Please enter a valid email",
        })
        .max(255),
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
});

export const LoginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }).nonempty().max(255),
    password: z.string().min(8, { message: "Password must be 8 characters long." }).max(255).nonempty(),
});

export const OtpSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, { message: "OTP must be a 6-digit number." }),
});

export type SignUpType = z.infer<typeof SignUpSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type OtpType = z.infer<typeof OtpSchema>;
