import { activity_level } from "@prisma/client";
import { z } from "zod";

export const HealthMonitoringSchema = z.object({
    activity_level: z.enum(Object.values(activity_level) as [activity_level, ...activity_level[]], {
        required_error: "Activity level is required",
        invalid_type_error: "Activity level must be one of the following: very low, low, norma, high, very high",
    }),
    weight_kg: z
        .union([
            z.string().transform((val) => {
                const parsed = parseFloat(val);
                if (isNaN(parsed)) throw new Error("Weight must be a valid number");
                return parsed;
            }),
            z.number(),
        ])
        .refine((value) => value > 0, {
            message: "Weight must be a positive number",
        }),
    temperature_celsius: z.union([
        z.string().transform((val) => {
            const parsed = parseFloat(val);
            if (isNaN(parsed)) throw new Error("Temperature must be a valid number");
            return parsed;
        }),
        z.number(),
    ]),
    symptoms: z.string(),
    notes: z.string().optional(),
    pet_id: z.number(),
    pet_uuid: z.string().uuid({ message: "Pet UUID must be a valid UUID" }),
});

export type HealthMonitoringType = z.infer<typeof HealthMonitoringSchema>;
