"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib";

interface MessageItemProps {
    content: string;
    sender: {
        id: string;
        name: string;
        image?: string;
    };
    timestamp: Date;
    isCurrentUser: boolean;
}

export function MessageItem({ content, sender, timestamp, isCurrentUser }: MessageItemProps) {
    return (
        <div className={cn("flex gap-3 max-w-[85%]", isCurrentUser ? "ml-auto flex-row-reverse" : "")}>
            <Avatar className="h-8 w-8">
                {sender.image && <AvatarImage src={sender.image} alt={sender.name} />}
                <AvatarFallback>{sender.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
                <div
                    className={cn("rounded-lg p-3", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}
                >
                    <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
                </div>

                <div className={cn("text-xs text-muted-foreground mt-1", isCurrentUser ? "text-right" : "")}>
                    {formatDistanceToNow(timestamp, { addSuffix: true })}
                </div>
            </div>
        </div>
    );
}
