"use client";
import React, { useState } from "react";
import {
    Avatar,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
    Textarea,
    Separator,
} from "@/components/ui";
import { addForumComment } from "@/actions";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { ForumCommentSchema } from "@/schemas";

interface ForumCommentsProps {
    postUuid: string;
    comments: {
        comment_id: number;
        content: string;
        created_at: Date;
        updated_at: Date;
        users: {
            first_name: string;
            last_name: string;
            user_uuid: string;
        } | null;
    }[];
}

export function ForumComments({ postUuid, comments }: ForumCommentsProps) {
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validate the comment first
            const validationResult = ForumCommentSchema.safeParse({ content: newComment });

            if (!validationResult.success) {
                const errorMessage = validationResult.error.errors[0]?.message || "Comment validation failed";
                toast.error(errorMessage);
                return;
            }

            setIsSubmitting(true);

            // Submit the comment
            const result = await addForumComment(postUuid, newComment);

            if (result.success) {
                toast.success("Comment added successfully");
                setNewComment(""); // Clear the comment box
            } else {
                toast.error(result.error || "Failed to add comment");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader className="pb-3">
                <CardTitle>Comments ({comments.length})</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.comment_id} className="pb-4">
                            <div className="flex items-start gap-3 mb-2">
                                <Avatar className="h-8 w-8">
                                    <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center font-semibold">
                                        {comment.users ? comment.users.first_name.charAt(0) : "?"}
                                    </div>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="bg-muted p-3 rounded-lg">
                                        <div className="font-medium mb-1">
                                            {comment.users
                                                ? `${comment.users.first_name} ${comment.users.last_name}`
                                                : "Unknown User"}
                                        </div>
                                        <p className="text-sm text-foreground">{comment.content}</p>
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        No comments yet. Be the first to comment!
                    </div>
                )}
            </CardContent>

            <Separator className="my-1" />

            <CardFooter className="pt-4">
                <form onSubmit={handleSubmit} className="w-full space-y-3">
                    <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                            {isSubmitting ? "Posting..." : "Post Comment"}
                        </Button>
                    </div>
                </form>
            </CardFooter>
        </Card>
    );
}
