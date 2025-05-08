"use server";

import { prisma } from "@/lib";
import { type ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { createNotification } from "./notification";
import type { forum_posts, post_category, role_type } from "@prisma/client";

/**
 * Get all forum posts with pagination
 */
export async function getForumPosts({ page = 1, pageSize = 10, category = "", tag = "" }): Promise<
    ActionResponse<{
        posts: forum_posts[];
        totalPosts: number;
        totalPages: number;
    }>
> {
    try {
        const skip = (page - 1) * pageSize;

        // Build where condition based on filters
        const where = {
            ...(category ? { category: category as post_category } : {}),
            ...(tag ? { tags: { has: tag } } : {}),
        };

        // Get total count for pagination
        const totalPosts = await prisma.forum_posts.count({ where });
        const totalPages = Math.ceil(totalPosts / pageSize);

        // Get posts with pagination
        const posts = await prisma.forum_posts.findMany({
            where,
            include: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                        user_uuid: true,
                    },
                },
                forum_comments: {
                    select: {
                        comment_id: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
            skip,
            take: pageSize,
        });

        return {
            success: true,
            data: {
                posts,
                totalPosts,
                totalPages,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Get a single forum post by UUID
 */
export async function getForumPost(postUuid: string): Promise<
    ActionResponse<{
        post: {
            post_uuid: string;
            title: string;
            content: string;
            category: post_category;
            created_at: Date;
            updated_at: Date;
            tags?: string[];
            users?: {
                first_name: string;
                last_name: string;
                user_uuid: string;
                role: role_type;
            };
            forum_comments?: {
                comment_id: number;
                content: string;
                created_at: Date;
                updated_at: Date;
                users?: {
                    first_name: string;
                    last_name: string;
                    user_uuid: string;
                    role: role_type;
                };
            }[];
        };
    }>
> {
    try {
        const post = await prisma.forum_posts.findUnique({
            where: { post_uuid: postUuid },
            include: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                        user_uuid: true,
                        role: true,
                    },
                },
                forum_comments: {
                    include: {
                        users: {
                            select: {
                                first_name: true,
                                last_name: true,
                                user_uuid: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        created_at: "asc",
                    },
                },
            },
        });

        if (!post) {
            return {
                success: false,
                error: "Post not found",
            };
        }

        // Convert null users to undefined to match the expected return type
        const formattedPost = {
            ...post,
            users: post.users || undefined,
            forum_comments: post.forum_comments.map((comment) => ({
                ...comment,
                users: comment.users || undefined,
            })),
        };

        return {
            success: true,
            data: { post: formattedPost },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Create a new forum post
 */
export async function createForumPost(values: {
    title: string;
    content: string;
    category: post_category;
    tags?: string[];
}): Promise<ActionResponse<{ postUuid: string }>> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");

    try {
        const { title, content, category, tags = [] } = values;

        const post = await prisma.forum_posts.create({
            data: {
                title,
                content,
                category,
                tags: tags,
                user_id: Number(session.user.id),
            },
        });

        revalidatePath("/user/forum");

        return {
            success: true,
            data: { postUuid: post.post_uuid },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Add a comment to a forum post
 */
export async function addForumComment(
    postUuid: string,
    content: string,
): Promise<ActionResponse<{ commentId: number }>> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");

    try {
        // Get the post to comment on
        const post = await prisma.forum_posts.findUnique({
            where: { post_uuid: postUuid },
            include: {
                users: {
                    select: {
                        user_id: true,
                    },
                },
            },
        });

        if (!post) {
            return {
                success: false,
                error: "Post not found",
            };
        }

        // Create the comment
        const comment = await prisma.forum_comments.create({
            data: {
                content,
                post_id: post.post_id,
                user_id: Number(session.user.id),
            },
        });

        // Send notification to the post author if it's not the same user
        if (post.users && post.users.user_id !== Number(session.user.id)) {
            await createNotification({
                userId: post.users.user_id,
                title: "New comment on your post",
                content: `Someone commented on your post "${post.title}"`,
                type: "forum_reply",
                forumPostId: post.post_id,
            });
        }

        revalidatePath(`/user/forum/${postUuid}`);

        return {
            success: true,
            data: { commentId: comment.comment_id },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Get forum categories and popular tags
 */
export async function getForumMetadata(): Promise<
    ActionResponse<{
        categories: string[];
        popularTags: string[];
    }>
> {
    try {
        // Get all unique categories
        const categoryResults = await prisma.forum_posts.groupBy({
            by: ["category"],
            _count: {
                post_id: true,
            },
            orderBy: {
                _count: {
                    post_id: "desc",
                },
            },
        });

        const categories = categoryResults.map((c) => c.category);

        // Aggregate all tags and count occurrences
        const posts = await prisma.forum_posts.findMany({
            select: {
                tags: true,
            },
        });

        const tagCounter = new Map<string, number>();

        posts.forEach((post) => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach((tag) => {
                    const currentCount = tagCounter.get(tag as string) || 0;
                    tagCounter.set(tag as string, currentCount + 1);
                });
            }
        });

        // Convert the Map to an array of [tag, count] pairs, sort by count, and take the top 10
        const popularTags = Array.from(tagCounter.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag]) => tag);

        return {
            success: true,
            data: {
                categories,
                popularTags,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
