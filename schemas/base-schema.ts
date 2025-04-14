import { z } from "zod";

export const BaseIdentifierSchema = z.object({
    user_id: z.string(),
});

export const BaseUserProfileSchema = z.object({
    first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
    last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone_number: z.string().min(10, { message: "Please enter a valid phone number" }),
});

export type BaseIdentifierType = z.infer<typeof BaseIdentifierSchema>;
export type BaseUserProfileType = z.infer<typeof BaseUserProfileSchema>;
