"use client";

import * as React from "react";
import { Send } from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Input,
} from "@/components/ui";
import { getMessages, sendMessage } from "@/actions";
import type { messages } from "@prisma/client";

interface AppointmentChatProps {
    appointmentId: number;
    petOwnerId: number;
    vetId: number;
    isVetView?: boolean;
}

export default function AppointmentChat({ appointmentId, petOwnerId, vetId, isVetView = true }: AppointmentChatProps) {
    const [messages, setMessages] = React.useState<messages[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [input, setInput] = React.useState("");
    const inputLength = input.trim().length;

    React.useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (!appointmentId) return;

                // Fetch messages for this appointment
                const messagesResponse = await getMessages(appointmentId);
                if (messagesResponse.success && messagesResponse.data) {
                    const formattedMessages = messagesResponse.data.messages.map((msg) => ({
                        ...msg,
                        role: msg.sender_id === vetId ? "vet" : "user",
                    }));
                    setMessages(formattedMessages);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Set up polling for new messages
        const intervalId = setInterval(fetchMessages, 10000); // Poll every 10 seconds

        return () => clearInterval(intervalId);
    }, [appointmentId, vetId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputLength === 0 || !appointmentId) return;

        // Optimistically update UI
        const tempId = `temp-${Date.now()}`;
        const newMessage = {
            message_id: tempId,
            appointment_id: appointmentId,
            sender_id: isVetView ? vetId : petOwnerId,
            receiver_id: isVetView ? petOwnerId : vetId,
            content: input,
            created_at: new Date(),
            updated_at: new Date(),
            is_read: false,
            role: isVetView ? "vet" : "user",
        } as messages & { role: string };

        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        // Actually send the message
        try {
            await sendMessage(input, appointmentId);
            // Refetch messages to get the server-generated ID and ensure consistency
            const messagesResponse = await getMessages(appointmentId);
            if (messagesResponse.success && messagesResponse.data) {
                const formattedMessages = messagesResponse.data.messages.map((msg) => ({
                    ...msg,
                    role: msg.sender_id === vetId ? "vet" : "user",
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove the optimistic update if failed
            setMessages((prev) => prev.filter((msg) => msg.message_id !== tempId));
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-center items-center h-[200px]">
                        <p>Loading messages...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage src="/avatars/01.png" alt={isVetView ? "Pet owner" : "Veterinarian"} />
                        <AvatarFallback>{isVetView ? "PO" : "VET"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">Appointment Chat</p>
                        <p className="text-sm text-muted-foreground">
                            Messaging with {isVetView ? "pet owner" : "veterinarian"}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
                    {messages.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No messages yet. Start the conversation!
                        </p>
                    ) : (
                        messages.map((message, index) => {
                            const isCurrentUser =
                                (isVetView && message.role === "vet") || (!isVetView && message.role === "user");

                            return (
                                <div
                                    key={message.message_id || index}
                                    className={`flex ${isCurrentUser ? "ml-auto" : "mr-auto"} max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${
                                        isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                >
                                    {message.content}
                                    <span className="text-xs opacity-70 mt-1">
                                        {new Date(message.created_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                    <Input
                        id="message"
                        placeholder="Type your message..."
                        className="flex-1"
                        autoComplete="off"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                    />
                    <Button type="submit" size="icon" disabled={inputLength === 0}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
