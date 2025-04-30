import { activity_level } from "@prisma/client";
import { z } from "zod";

export const HealthMonitoringSchema = z.object({
    activity_level: z.enum(Object.values(activity_level) as [activity_level, ...activity_level[]], {
        required_error: "Activity level is required",
        invalid_type_error: "Activity level must be one of the following: very low, low, norma, high, very high",
    }),
    weight_kg: z.number().min(0, { message: "Weight must be a positive number" }),
    temperature_celsius: z.number().min(0, { message: "Temperature must be a positive number" }),
    symptoms: z.string(),
    notes: z.string().optional(),
    pet_id: z.number(),
    pet_uuid: z.string().uuid({ message: "Pet UUID must be a valid UUID" }),
});

export type HealthMonitoringType = z.infer<typeof HealthMonitoringSchema>;
