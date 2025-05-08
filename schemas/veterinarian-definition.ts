import { z } from "zod";
import { SignUpSchema } from "./auth-definitions";
import { veterinary_specialization } from "@prisma/client";

const VeterinaryAvailabilitySchema = z
    .object({
        day_of_week: z.number().min(0).max(6),
        start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
            message: "Time must be in format HH:MM",
        }),
        end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
            message: "Time must be in format HH:MM",
        }),
        is_available: z.boolean().default(false),
    })
    .refine(
        (data) => {
            if (data.is_available) return true;
            return data.start_time < data.end_time;
        },
        {
            message: "Opening time must be before closing time",
            path: ["closes_at"],
        },
    );

export const VeterinarianSchema = z.object({
    ...SignUpSchema.innerType().shape,
    license_number: z.string().nonempty({ message: "License number is required." }),
    specialization: z
        .enum(Object.values(veterinary_specialization) as [veterinary_specialization, ...veterinary_specialization[]], {
            message: "Invalid specialization type",
            required_error: "Specialization is required",
            invalid_type_error: "Invalid specialization type",
        })
        .refine(
            (value) => {
                return Object.values(veterinary_specialization).includes(value as veterinary_specialization);
            },
            {
                message: "Invalid specialization type",
            },
        ),
    veterinary_availability: z.array(VeterinaryAvailabilitySchema),
});

export type VeterinarianType = z.infer<typeof VeterinarianSchema>;
