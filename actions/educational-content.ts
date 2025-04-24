"use server";
import { prisma } from "@/lib";
import type { ActionResponse } from "@/types/server-action-response";
import type { educational_content } from "@prisma/client";
import type { EducationalContentFilters } from "@/types";
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
