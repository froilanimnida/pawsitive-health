import { prescription_schedule_type } from "@prisma/client";
import { z } from "zod";

// Define the schedule type as a proper TypeScript enum
//export enum PrescriptionScheduleType {
//    ONCE_DAILY = "once_daily",
//    TWICE_DAILY = "twice_daily",
//    THREE_TIMES_DAILY = "three_times_daily",
//    FOUR_TIMES_DAILY = "four_times_daily",
//    EVERY_OTHER_DAY = "every_other_day",
//    WEEKLY = "weekly",
//    AS_NEEDED = "as_needed",
//    CUSTOM = "custom",
//}

// Create Zod schema from the TypeScript enum

// Time slot definition for medication schedules
export const TimeSlotSchema = z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
    enabled: z.boolean().default(true),
});

export const PrescriptionDefinition = z.object({
    dosage: z.string(),
    frequency: z.string(),
    start_date: z.date(),
    end_date: z.date(),
    refills_remaining: z.coerce.number(),
    pet_uuid: z
        .string()
        .uuid({
            message: "Invalid pet UUID",
        })
        .optional(),
    pet_id: z.number(),
    appointment_id: z.number().optional(),
    vet_id: z.number().optional(),
    appointment_uuid: z.string().uuid().optional(),
    medication_id: z.union([z.string().transform((val) => parseInt(val, 10)), z.number()]),
    schedule_type: z
        .enum(
            Object.values(prescription_schedule_type) as [prescription_schedule_type, ...prescription_schedule_type[]],
        )
        .default(prescription_schedule_type.once_daily),
    time_slots: z.array(TimeSlotSchema).default([]),
    add_to_calendar: z.boolean().default(true),
    reminder_minutes_before: z.number().default(15),
    custom_schedule_description: z.string().optional(),
    custom_instructions: z.string().optional(),
    calendar_sync_enabled: z.boolean().default(true),
});

export type TimeSlotType = z.infer<typeof TimeSlotSchema>;
export type PrescriptionType = z.infer<typeof PrescriptionDefinition>;
