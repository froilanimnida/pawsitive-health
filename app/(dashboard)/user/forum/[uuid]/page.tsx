import React from "react";
import { notFound } from "next/navigation";
import { getForumPost } from "@/actions";
import { Avatar, Badge, Card, CardContent, CardHeader } from "@/components/ui";
import { ForumComments } from "@/components/forum";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import type { UUIDPageParams } from "@/types";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

// Generate metadata for the page
export async function generateMetadata({ params }: UUIDPageParams): Promise<Metadata> {
    const { uuid } = await params;
    const postResponse = await getForumPost(uuid);
    if (!postResponse.success || !postResponse.data.post) {
        return {
            title: "Post Not Found | PawsitiveHealth",
            description: "The requested forum post could not be found.",
        };
    }

    const post = postResponse.data.post;
    return {
        title: `${post.title} | Forum | PawsitiveHealth`,
        description: post.content.substring(0, 160),
    };
}

// Post page component
export default async function ForumPostPage({ params }: UUIDPageParams) {
    const { uuid } = await params;
    // Get post data with its comments
    const postResponse = await getForumPost(uuid);
    const session = await getServerSession(authOptions);

    // If post not found, show 404 page
    if (
        !postResponse.success ||
        !postResponse.data.post ||
        !session ||
        !session.user ||
        !session.user.id ||
        !session.user.role
    ) {
        notFound();
    }

    const post = postResponse.data.post;

    // Format the post date as "X days ago"
    const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

    // Format the author name
    const authorName = post.users ? `${post.users.first_name} ${post.users.last_name}` : "Unknown User";

    return (
        <div className="container py-8">
            {/* Back button and breadcrumb */}
            <div className="mb-6">
                <Link
                    href="/user/forum"
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Back to Forum</span>
                </Link>
            </div>

            {/* Main post content */}
            <Card className="mb-6">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="capitalize">
                            {post.category}
                        </Badge>
                        <div className="text-sm text-muted-foreground">Posted {formattedDate}</div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">{post.title}</h1>
                </CardHeader>

                <CardContent>
                    {/* Author info */}
                    <div className="flex items-center gap-3 mb-6">
                        <Avatar className="h-10 w-10">
                            <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center font-semibold">
                                {post.users ? post.users.first_name.charAt(0) : "?"}
                            </div>
                        </Avatar>
                        <div>
                            <div className="font-semibold">{authorName}</div>
                            <div className="text-sm text-muted-foreground">Community Member</div>
                        </div>
                    </div>

                    {/* Post content */}
                    <div className="prose dark:prose-invert max-w-none mb-6">
                        {post.content.split("\n").map((paragraph: string, index: number) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    {/* Post tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                            {post.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="flex items-center">
                                    <Tag className="h-3 w-3 mr-1" /> {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Comments section */}
            <ForumComments
                postUuid={uuid}
                comments={(post.forum_comments || []).map((comment) => ({
                    ...comment,
                    users: comment.users || null,
                }))}
            />
        </div>
    );
}
