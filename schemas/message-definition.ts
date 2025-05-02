import { z } from "zod";
import { BaseIdentifierSchema } from "./base-schema";

export const SendMessageSchema = BaseIdentifierSchema.extend({
    text: z.string().min(1, "Message content is required").max(2000, "Message cannot exceed 2000 characters"),
    appointment_id: z.number({ required_error: "Appointment ID is required" }),
});

export const GetMessagesSchema = BaseIdentifierSchema.extend({
    appointment_id: z.number({ required_error: "Appointment ID is required" }),
});

export type SendMessageType = z.infer<typeof SendMessageSchema>;
export type GetMessagesType = z.infer<typeof GetMessagesSchema>;
