"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
    Calendar,
} from "@/components/ui";
import { createVaccination } from "@/actions";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PetVaccinationSchema, type PetVaccinationType } from "@/schemas";

export function VaccinationForm({
    petUuid,
    appointmentUuid,
}: {
    petUuid: string;
    appointmentUuid: string;
    vetId: number;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(PetVaccinationSchema),
        defaultValues: {
            vaccine_name: "",
            administered_date: new Date(),
            batch_number: "",
            pet_uuid: petUuid,
            appointment_uuid: appointmentUuid,
            next_due_date: undefined,
        },
    });

    async function onSubmit(data: PetVaccinationType) {
        setIsSubmitting(true);

        try {
            const result = await createVaccination({
                pet_uuid: petUuid,
                appointment_uuid: appointmentUuid,
                vaccine_name: data.vaccine_name,
                administered_date: data.administered_date,
                next_due_date: data.next_due_date,
                batch_number: data.batch_number || "",
            });

            if (result.success) {
                toast.success("Vaccination recorded successfully");
                form.reset({
                    vaccine_name: "",
                    administered_date: new Date(),
                    batch_number: "",
                });
            } else {
                toast.error(result.error || "Failed to record vaccination");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="vaccine_name"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Vaccine Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter vaccine name" {...field} />
                            </FormControl>
                            <FormDescription>The name of the vaccine administered</FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="administered_date"
                        render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date Administered</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="batch_number"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Batch Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter batch number" {...field} />
                                </FormControl>
                                <FormDescription>Optional batch/lot number</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="next_due_date"
                    render={({ field, fieldState }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Next Due Date (Optional)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Select next due date</span>
                                            )}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date <= new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>When the next vaccination is due</FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Recording..." : "Record Vaccination"}
                </Button>
            </form>
        </Form>
    );
}
