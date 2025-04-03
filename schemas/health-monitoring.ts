import { z } from "zod";

export const HealthMonitoringSchema = z.object({
    activity_level: z.string().nonempty({ message: "Activity level is required" }),
    weight_kg: z.number().min(0, { message: "Weight must be a positive number" }),
    temperature_celsius: z.number().min(0, { message: "Temperature must be a positive number" }),
    symptoms: z.string(),
    notes: z.string().optional(),
});

export type HealthMonitoringType = z.infer<typeof HealthMonitoringSchema>;
