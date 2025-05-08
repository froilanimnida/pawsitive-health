"use client";
import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, Badge, Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui";
import { MessageSquare, Tag } from "lucide-react";
import { role_type } from "@prisma/client";

interface ForumPostCardProps {
    role: role_type;
    post: {
        post_uuid: string;
        title: string;
        content: string;
        category: string;
        tags?: string[];
        created_at: Date;
        users?: {
            first_name: string;
            last_name: string;
            user_uuid: string;
        } | null;
        forum_comments?: {
            comment_id: number;
        }[];
    };
}

export function ForumPostCard({ post, role }: ForumPostCardProps) {
    // Format the date to "X days ago" format
    const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

    // Get the author name
    const authorName = post.users ? `${post.users.first_name} ${post.users.last_name}` : "Unknown User";

    // Get comment count
    const commentCount = post.forum_comments?.length || 0;

    // Truncate content for preview
    const previewContent = post.content.length > 250 ? post.content.substring(0, 250) + "..." : post.content;

    return (
        <Card className="hover:border-primary/50 transition-colors">
            <Link
                href={role === role_type.user ? `/user/forum/${post.post_uuid}` : `/vet/forum/${post.post_uuid}`}
                className="block"
            >
                <CardHeader className="pb-2">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">
                            {post.category}
                        </Badge>
                        <div className="text-sm text-muted-foreground">{formattedDate}</div>
                    </div>
                    <CardTitle className="hover:text-primary transition-colors">{post.title}</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-7 w-7">
                            <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-xs font-semibold">
                                {post.users ? post.users.first_name.charAt(0) : "?"}
                            </div>
                        </Avatar>
                        <div className="text-sm font-medium">{authorName}</div>
                    </div>

                    <div className="text-sm text-muted-foreground">{previewContent}</div>
                </CardContent>

                <CardFooter className="pt-2 border-t flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {commentCount} {commentCount === 1 ? "comment" : "comments"}
                    </div>

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 overflow-hidden">
                            {post.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                </Badge>
                            ))}
                            {post.tags.length > 2 && (
                                <span className="text-xs text-muted-foreground self-center">
                                    +{post.tags.length - 2} more
                                </span>
                            )}
                        </div>
                    )}
                </CardFooter>
            </Link>
        </Card>
    );
}
