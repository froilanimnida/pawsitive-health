"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    RadioGroup,
    RadioGroupItem,
    Label,
    Button,
    FormMessage,
} from "@/components/ui";
import { Moon, Sun, Monitor } from "lucide-react";
import { changeTheme } from "@/actions";
import { useForm } from "react-hook-form";
import { type ThemeType, ThemeSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { theme_mode } from "@prisma/client";

export default function AppearanceForm({ theme_mode, user_id }: { theme_mode: theme_mode; user_id: string }) {
    const [isLoading, setIsLoading] = useState(false);
    async function onSubmit(values: ThemeType) {
        setIsLoading(true);
        try {
            const result = await changeTheme(values);
            if (!result.success) {
                toast.error(result.error || "Failed to save appearance preferences");
            }
            toast.success("Appearance preferences saved successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save appearance preferences");
        } finally {
            setIsLoading(false);
        }
    }

    const themeForm = useForm({
        resolver: zodResolver(ThemeSchema),
        progressive: true,
        mode: "onBlur",
        shouldFocusError: true,
        defaultValues: {
            theme_mode: theme_mode,
            user_id: user_id,
        },
    });

    return (
        <Form {...themeForm}>
            <form onSubmit={themeForm.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    name="theme"
                    render={({ field, fieldState }) => (
                        <FormItem className="space-y-4">
                            <FormLabel>Theme</FormLabel>
                            <FormDescription>Select the theme for the PawsitiveHealth application.</FormDescription>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    name="theme_mode"
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="light" id="light" />
                                        <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                                            <Sun className="h-4 w-4" />
                                            Light
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="dark" id="dark" />
                                        <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                                            <Moon className="h-4 w-4" />
                                            Dark
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="system" id="system" />
                                        <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                                            <Monitor className="h-4 w-4" />
                                            System
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="mt-6">
                    <FormDescription>
                        Changes to appearance are applied immediately, but you can save them to your account for future
                        sessions.
                    </FormDescription>
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
            </form>
        </Form>
    );
}
