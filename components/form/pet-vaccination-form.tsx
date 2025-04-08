"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    FormItem,
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
    FormDescription,
    Input,
    Button,
    Calendar,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui";
import { createVaccination } from "@/actions";
import { type PetVaccinationType, PetVaccinationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib";

const PetVaccinationForm = ({ petUuid }: { petUuid: string }) => {
    const [isLoading, setIsLoading] = useState(false);

    const vaccinationForm = useForm({
        resolver: zodResolver(PetVaccinationSchema),
        reValidateMode: "onChange",
        shouldFocusError: true,
        progressive: true,
        defaultValues: {
            pet_uuid: petUuid,
            vaccine_name: "",
            administered_date: new Date(),
            next_due_date: undefined,
            batch_number: "",
        },
    });

    const onSubmit = async (values: PetVaccinationType) => {
        setIsLoading(true);

        try {
            const result = await createVaccination(values);

            if (result.success) {
                toast.success("Vaccination record added successfully");
                vaccinationForm.reset({
                    pet_uuid: petUuid,
                    vaccine_name: "",
                    administered_date: new Date(),
                    next_due_date: undefined,
                    batch_number: "",
                });
            } else {
                toast.error(result.error || "Failed to add vaccination record");
            }
        } catch (error) {
            console.error("Error adding vaccination record:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...vaccinationForm}>
            <form onSubmit={vaccinationForm.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-6">
                    <FormField
                        control={vaccinationForm.control}
                        name="vaccine_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vaccine Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter vaccine name" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>The name of the vaccine administered</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={vaccinationForm.control}
                        name="batch_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Batch Number (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter batch number" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>The batch or lot number of the vaccine</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={vaccinationForm.control}
                        name="administered_date"
                        render={({ field }) => (
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
                                                disabled={isLoading}
                                                type="button"
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
                                            disabled={(date) => date > new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>The date when the vaccination was given</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={vaccinationForm.control}
                        name="next_due_date"
                        render={({ field }) => (
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
                                                disabled={isLoading}
                                                type="button"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Select due date</span>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Add Vaccination"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PetVaccinationForm;
