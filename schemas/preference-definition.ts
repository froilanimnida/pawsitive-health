import { z } from "zod";
import { BaseIdentifierSchema } from "./base-schema";

export const ThemeSchema = BaseIdentifierSchema.extend({
    theme_mode: z.enum(["light", "dark", "system"]),
});

export const GoogleCalendarSchema = BaseIdentifierSchema.extend({
    google_calendar_sync: z.boolean(),
    google_calendar_token: z.string(),
});

export type ThemeType = z.infer<typeof ThemeSchema>;
export type GoogleCalendarType = z.infer<typeof GoogleCalendarSchema>;
