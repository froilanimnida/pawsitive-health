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
import { appointment_status, messages } from "@prisma/client";
import type { Modify } from "@/types";

// Define the chat participants interface
interface ChatParticipants {
    currentUserId: number;
    otherUserId: number;
    appointmentId: number;
}

export default function AppointmentChat({
    chatParticipants,
    isVetView = true,
    appointmentStatus,
    initialMessages,
}: {
    chatParticipants: ChatParticipants;
    isVetView?: boolean;
    appointmentStatus: appointment_status;
    initialMessages: Modify<messages, { message_id: string }>[] | [];
}) {
    const [messages, setMessages] = React.useState<Modify<messages, { message_id: string }>[] | []>(initialMessages);
    const [loading, setLoading] = React.useState(true);
    const [input, setInput] = React.useState("");
    const inputLength = input.trim().length;

    const { currentUserId, otherUserId, appointmentId } = chatParticipants;

    React.useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (!appointmentId) return;

                // Fetch messages for this appointment
                const messagesResponse = await getMessages(appointmentId);
                if (messagesResponse.success && messagesResponse.data) {
                    setMessages(messagesResponse.data.messages);
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
    }, [appointmentId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputLength === 0 || !appointmentId) return;

        // Optimistically update UI with temporary message
        const tempId = `temp-${Date.now()}`;
        const newMessage: Modify<messages, { message_id: string }> = {
            message_id: tempId,
            appointment_id: appointmentId,
            sender_id: currentUserId,
            receiver_id: otherUserId,
            content: input,
            created_at: new Date(),
            is_read: false,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        // Actually send the message
        try {
            // Pass the receiver ID directly to the server action
            const r = await sendMessage(input, appointmentId, otherUserId);
            console.log("Message sent:", r);

            // Refetch messages to get the server-generated ID and ensure consistency
            const messagesResponse = await getMessages(appointmentId);
            if (messagesResponse.success && messagesResponse.data) {
                setMessages(messagesResponse.data.messages);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove the optimistic update if failed
            setMessages((prev) =>
                prev.filter((msg) => !(typeof msg.message_id === "string" && msg.message_id === tempId)),
            );
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
                            // Simply check if the sender is the current user
                            const isCurrentUser = message.sender_id === currentUserId;

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
                        autoFocus
                        disabled={
                            appointmentStatus === appointment_status.completed ||
                            appointmentStatus === appointment_status.cancelled
                        }
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
