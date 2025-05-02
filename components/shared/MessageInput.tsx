"use client";

import { useState } from "react";
import { Button, Textarea } from "@/components/ui";
import { Send } from "lucide-react";
import { cn } from "@/lib";

interface MessageInputProps {
    onSendMessage: (content: string) => Promise<void>;
    isDisabled?: boolean;
    placeholder?: string;
}

export function MessageInput({
    onSendMessage,
    isDisabled = false,
    placeholder = "Type your message here...",
}: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = async () => {
        if (!message.trim() || isDisabled || isSending) return;

        try {
            setIsSending(true);
            await onSendMessage(message);
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSendMessage();
        }
    };

    return (
        <div className="p-4 border-t flex gap-2 items-end">
            <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="resize-none min-h-[60px]"
                disabled={isDisabled || isSending}
            />
            <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isDisabled || isSending}
                size="icon"
                className={cn(
                    "shrink-0 transition-opacity",
                    !message.trim() || isDisabled ? "opacity-50" : "opacity-100",
                )}
            >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
            </Button>
        </div>
    );
}
