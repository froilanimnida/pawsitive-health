"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

interface User {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
}

interface Message {
    message_id: number;
    content: string;
    created_at: Date;
    sender_id: number;
    receiver_id: number;
    sender: User;
    receiver: User;
}

interface MessageThreadProps {
    messages: Message[];
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
                const sender = message.sender;

                return (
                    <MessageItem
                        key={message.message_id}
                        content={message.content}
                        senderName={`${sender.first_name} ${sender.last_name}`}
                        senderAvatar={sender.avatar_url}
                        sentAt={new Date(message.created_at)}
                        isSentByCurrentUser={isSentByCurrentUser}
                    />
                );
            })}
            <div ref={endOfMessagesRef} />
        </div>
    );
}
