"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib";
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

interface Message {
    message_id?: number;
    sender_id?: number;
    receiver_id?: number;
    content: string;
    role: "vet" | "user";
    created_at?: Date;
    sender_name?: string;
}

export default function VeterinaryAppointmentThread() {
    const params = useParams();
    const uuid = params.uuid as string;

    const [messages, setMessages] = React.useState<Message[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [input, setInput] = React.useState("");
    const inputLength = input.trim().length;
    const [appointmentId, setAppointmentId] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchAppointmentData = async () => {
            try {
                if (!uuid) return;

                // First get the appointment ID from the UUID
                const response = await fetch(`/api/appointments/${uuid}`);
                const appointmentData = await response.json();

                if (appointmentData?.appointment_id) {
                    setAppointmentId(appointmentData.appointment_id);

                    // Then fetch messages for this appointment
                    const messagesResponse = await getMessages(appointmentData.appointment_id);
                    if (messagesResponse.success && messagesResponse.data) {
                        const formattedMessages = messagesResponse.data.messages.map((msg) => ({
                            ...msg,
                            role: msg.sender_id === appointmentData.veterinarian_id ? "vet" : "user",
                        }));
                        setMessages(formattedMessages);
                    }
                }
            } catch (error) {
                console.error("Error fetching appointment data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointmentData();
    }, [uuid]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputLength === 0 || !appointmentId) return;

        // Optimistically update UI
        const newMessage = {
            content: input,
            role: "vet" as const,
            created_at: new Date(),
        };

        setMessages([...messages, newMessage]);
        setInput("");

        // Actually send the message
        try {
            await sendMessage(input, appointmentId);
        } catch (error) {
            console.error("Error sending message:", error);
            // Could add error handling UI here
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <p>Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="container py-6 max-w-3xl">
            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src="/avatars/01.png" alt="Pet owner" />
                            <AvatarFallback>PO</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium leading-none">Appointment Chat</p>
                            <p className="text-sm text-muted-foreground">Messaging with pet owner</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No messages yet. Start the conversation!
                            </p>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                        message.role === "vet"
                                            ? "ml-auto bg-primary text-primary-foreground"
                                            : "bg-muted",
                                    )}
                                >
                                    {message.content}
                                </div>
                            ))
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
                            <Send />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
