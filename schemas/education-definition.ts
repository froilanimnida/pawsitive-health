import { z } from "zod";
import { BaseIdentifierSchema } from "./base-schema";

export const EducationalContentSchema = BaseIdentifierSchema.extend({
    title: z.string().min(5, "Title must be at least 5 characters").max(255, "Title cannot exceed 255 characters"),
    content: z.string().min(50, "Content must be at least 50 characters"),
    category: z.string().min(2, "Category is required"),
    tags: z.array(z.string()).min(1, "At least one tag is required").max(10, "Cannot have more than 10 tags"),
});

export type EducationalContentType = z.infer<typeof EducationalContentSchema>;
