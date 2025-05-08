"use server";

import { prisma } from "@/lib";
import type { educational_content } from "@prisma/client";
import type { EducationalContentFilters, ActionResponse } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { type EducationalContentType } from "@/schemas";

/**
 * Fetch educational content with optional filtering
 */
export async function getEducationalContent(
    filters?: EducationalContentFilters,
    page = 1,
    pageSize = 10,
): Promise<
    ActionResponse<{ content: educational_content[]; totalCount: number; categories: string[]; popularTags: string[] }>
> {
    try {
        const where: {
            category?: string;
            tags?: {
                hasSome: string[];
            };
            OR?: Array<{
                title?: { contains: string; mode: "insensitive" };
                content?: { contains: string; mode: "insensitive" };
                tags?: { has: string };
            }>;
        } = {};

        // Apply filters if provided
        if (filters) {
            if (filters.category) {
                where.category = filters.category;
            }

            if (filters.tags && filters.tags.length > 0) {
                where.tags = {
                    hasSome: filters.tags,
                };
            }

            if (filters.search && filters.search.trim() !== "") {
                const searchTerm = filters.search.trim();
                where.OR = [
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { content: { contains: searchTerm, mode: "insensitive" } },
                    { tags: { has: searchTerm } },
                ];
            }
        }

        // Get total count for pagination
        const totalCount = await prisma.educational_content.count({ where });

        // Fetch paginated results
        const content = await prisma.educational_content.findMany({
            where,
            include: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
            orderBy: { published_at: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        // Get all unique categories for filtering
        const categoryResults = await prisma.educational_content.groupBy({
            by: ["category"],
        });
        const categories = categoryResults.map((item) => item.category);

        // Get popular tags
        const allContent = await prisma.educational_content.findMany({
            select: { tags: true },
        });

        // Count tag occurrences
        const tagCounts = allContent
            .flatMap((item) => item.tags)
            .reduce(
                (acc, tag) => {
                    acc[tag] = (acc[tag] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>,
            );

        // Sort tags by frequency and take top 15
        const popularTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tag]) => tag);

        return {
            success: true,
            data: {
                content,
                totalCount,
                categories,
                popularTags,
            },
        };
    } catch (error) {
        console.error("Error fetching educational content:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Get a single educational content post by UUID
 */
export async function getEducationalContentByUuid(
    contentUuid: string,
): Promise<ActionResponse<{ content: educational_content }>> {
    try {
        const content = await prisma.educational_content.findUnique({
            where: { content_uuid: contentUuid },
            include: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });

        if (!content) {
            return {
                success: false,
                error: "Content not found",
            };
        }

        return {
            success: true,
            data: {
                content,
            },
        };
    } catch (error) {
        console.error("Error fetching educational content:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Create new educational content (veterinarian only)
 */
export async function createEducationalContent(
    data: EducationalContentType,
): Promise<ActionResponse<{ contentUuid: string }>> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) redirect("/signin");

    // Verify the user is a veterinarian
    const user = await prisma.users.findUnique({
        where: { user_id: Number(session.user.id) },
        include: { veterinarians: true },
    });

    if (!user || user.role !== "veterinarian" || !user.veterinarians) {
        return {
            success: false,
            error: "Only veterinarians can publish educational content",
        };
    }

    try {
        // Create the content
        const content = await prisma.educational_content.create({
            data: {
                title: data.title,
                content: data.content,
                category: data.category,
                tags: data.tags,
                author_id: user.user_id,
                published_at: new Date(),
                content_uuid: crypto.randomUUID(),
            },
        });

        revalidatePath("/education");
        revalidatePath(`/education/${content.content_uuid}`);

        return {
            success: true,
            data: { contentUuid: content.content_uuid },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Get available categories for educational content
 */
export async function getEducationalContentCategories(): Promise<ActionResponse<{ categories: string[] }>> {
    try {
        const categoryResults = await prisma.educational_content.groupBy({
            by: ["category"],
        });

        const categories = categoryResults.map((item) => item.category);

        // Add default categories if none exist yet
        if (categories.length === 0) {
            return {
                success: true,
                data: {
                    categories: [
                        "Nutrition",
                        "Training",
                        "Health",
                        "Behavior",
                        "Grooming",
                        "Preventative Care",
                        "Pet Safety",
                        "Common Diseases",
                        "Elderly Pet Care",
                        "Puppy & Kitten Care",
                        "Dental Health",
                        "Emergency Care",
                    ],
                },
            };
        }

        return {
            success: true,
            data: { categories },
        };
    } catch (error) {
        console.error("Error fetching educational categories:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
