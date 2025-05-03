"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, ScrollArea } from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendMessageSchema } from "@/schemas/message-definition";
import { sendMessage, getMessages } from "@/actions/messages";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { messages } from "@prisma/client";

interface AppointmentChatProps {
    appointmentId: number;
    currentUserId: number;
    otherPartyName: string;
    otherPartyAvatarUrl?: string;
    viewerType: "user" | "vet" | "clinic";
}

export const AppointmentChat = ({
    appointmentId,
    currentUserId,
    otherPartyName,
    otherPartyAvatarUrl,
    //viewerType,
}: AppointmentChatProps) => {
    const [messages, setMessages] = useState<messages[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors },
    } = useForm({
        resolver: zodResolver(SendMessageSchema),
        defaultValues: { text: "" },
    });

    // Fetch messages on component mount
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const result = await getMessages(appointmentId);
                if (result.success && result.data) {
                    setMessages(result.data.messages);
                } else {
                    toast.error("Failed to load messages");
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
                toast.error("An error occurred while loading messages");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Set up polling for new messages every 10 seconds
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [appointmentId]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const onSubmit = async ({ text }: { text: string }) => {
        try {
            const result = await sendMessage(text, appointmentId);
            if (result.success) {
                reset();
                // Optimistically add message to UI
                //const newMessage: Message = {
                //    id: Date.now(), // Temporary ID
                //    text,
                //    sender_id: currentUserId,
                //    receiver_id: 0, // This will be updated when we fetch messages again
                //    sender_name: viewerType === "user" ? "You" : "Veterinarian",
                //    created_at: new Date(),
                //    is_read: false,
                //};
                //setMessages([...messages, newMessage]);

                // Fetch updated messages
                const updatedMessages = await getMessages(appointmentId);
                if (updatedMessages.success && updatedMessages.data) {
                    //setMessages(updatedMessages.data);
                }
            } else {
                toast.error(result.error || "Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("An error occurred while sending your message");
        }
    };

    return (
        <Card className="w-full h-[500px] flex flex-col">
            <div className="p-4 border-b bg-muted/50 flex items-center space-x-2">
                <Avatar>
                    <AvatarImage src={otherPartyAvatarUrl} />
                    <AvatarFallback>{otherPartyName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{otherPartyName}</div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                {loading ? (
                    <div className="flex justify-center items-center h-full">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.message_id}
                                className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.sender_id === currentUserId
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    }`}
                                >
                                    <div className="text-sm">{message.content}</div>
                                    <div
                                        className={`text-[10px] mt-1 ${
                                            message.sender_id === currentUserId
                                                ? "text-primary-foreground/80"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t flex space-x-2">
                <Input
                    placeholder="Type your message..."
                    {...register("text")}
                    className={`flex-1 ${errors.text ? "border-destructive" : ""}`}
                    disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send"}
                </Button>
            </form>
        </Card>
    );
};

export default AppointmentChat;
