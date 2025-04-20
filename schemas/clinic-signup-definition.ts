import { z } from "zod";
import { SignUpSchema } from "./auth-definitions";
import { toTitleCase } from "@/lib";

const OperatingHoursSchema = z
    .object({
        day_of_week: z.number().min(0).max(6),
        opens_at: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
            message: "Time must be in format HH:MM",
        }),
        closes_at: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
            message: "Time must be in format HH:MM",
        }),
        is_closed: z.boolean().default(false),
    })
    .refine(
        (data) => {
            if (data.is_closed) return true;
            return data.opens_at < data.closes_at;
        },
        {
            message: "Opening time must be before closing time",
            path: ["closes_at"],
        },
    );

export const BaseClinicSchema = z.object({
    name: z
        .string({ message: "Name of the clinic is required" })
        .nonempty({ message: "Name of the clinic is required" })
        .transform((name) => toTitleCase(name)),
    address: z.string({ message: "Address is required" }).nonempty({ message: "Address is required" }),
    city: z.string({ required_error: "City is required" }).nonempty({ message: "City is required" }),
    state: z.string({ required_error: "State is required" }).nonempty({ message: "State is required" }),
    postal_code: z
        .string({ required_error: "Postal Code is required." })
        .nonempty({ message: "Postal Code is required." }),
    phone_number: z.string().nonempty({ message: "Phone number is required." }),
    emergency_services: z.boolean({
        required_error: "Emergency Services is required.",
    }),
    operating_hours: z.array(OperatingHoursSchema).length(7, {
        message: "Operating hours must be provided for all 7 days of the week",
    }),
    website: z.string().optional(),
    google_maps_url: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

export const NewClinicAccountSchema = z.object({
    ...BaseClinicSchema.shape,
    ...SignUpSchema.innerType().shape,
});

export type NewClinicAccountType = z.infer<typeof NewClinicAccountSchema>;
