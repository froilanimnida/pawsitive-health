"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import type { messages } from "@prisma/client";

interface MessageThreadProps {
    messages: messages[];
    currentUserId: number;
    isLoading?: boolean;
}

export function MessageThread({ messages, currentUserId, isLoading = false }: MessageThreadProps) {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom when messages change
    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
                <p className="text-muted-foreground">Loading messages...</p>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => {
                const isSentByCurrentUser = message.sender_id === currentUserId;

                return (
                    <MessageItem
                        isCurrentUser={isSentByCurrentUser}
                        timestamp={new Date(message.created_at)}
                        key={message.message_id}
                        content={message.content}
                    />
                );
            })}
            <div ref={endOfMessagesRef} />
        </div>
    );
}
