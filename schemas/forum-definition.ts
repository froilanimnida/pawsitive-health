import { post_category } from "@prisma/client";
import { z } from "zod";

/**
 * Schema for validating forum posts
 */
export const ForumPostSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters long" })
        .max(255, { message: "Title cannot exceed 255 characters" }),
    content: z.string().min(10, { message: "Content must be at least 10 characters long" }),
    category: z.enum(Object.values(post_category) as [post_category, ...post_category[]], {
        message: "Invalid category type",
        required_error: "Category is required",
        invalid_type_error: "Invalid category type",
    }),
    tags: z.array(z.string()).optional(),
});

export type ForumPostType = z.infer<typeof ForumPostSchema>;

/**
 * Schema for validating forum comments
 */
export const ForumCommentSchema = z.object({
    content: z
        .string()
        .min(1, { message: "Comment cannot be empty" })
        .max(1000, { message: "Comment cannot exceed 1000 characters" }),
});

export type ForumCommentType = z.infer<typeof ForumCommentSchema>;
