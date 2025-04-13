"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Button,
} from "@/components/ui";
import { updateUserProfile } from "@/actions/user";

// Create a schema for profile updates
const profileFormSchema = z.object({
    first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
    last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone_number: z.string().min(10, { message: "Please enter a valid phone number" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
        },
        mode: "onChange",
    });

    // Initialize form with user data when session is available
    useEffect(() => {
        if (session?.user && !hasLoaded) {
            const nameParts = session.user.name?.split(" ") || ["", ""];

            form.reset({
                first_name: nameParts[0] || "",
                last_name: nameParts.slice(1).join(" ") || "",
                email: session.user.email || "",
                phone_number: "", // We don't have this in the session, would need to fetch from API
            });

            setHasLoaded(true);
        }
    }, [session, form, hasLoaded]);

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true);

        try {
            const result = await updateUserProfile(data);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Update the session with new user data
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: `${data.first_name} ${data.last_name}`,
                    email: data.email,
                },
            });

            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your first name" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>Your first name as it appears on your account.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your last name" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>Your last name as it appears on your account.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your email" type="email" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormDescription>
                                Your email address used for notifications and account verification.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your phone number" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormDescription>
                                Your contact phone number for appointment reminders and alerts.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
}
