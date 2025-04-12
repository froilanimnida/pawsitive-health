"use client";
import { useState, useEffect } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Calendar,
} from "@/components/ui";
import { PrescriptionDefinition, type PrescriptionType } from "@/schemas/prescription-definition";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { z } from "zod";
import { addPrescription, getMedicationsList } from "@/actions";

const PrescriptionFormSchema = PrescriptionDefinition.extend({
    //pet_uuid: z.string().uuid(),
    appointment_uuid: z.string().uuid().optional(),
    medication_id: z.number(),
});

interface PrescriptionFormProps {
    petId: number;
    //petUuid: string;
    appointmentUuid: string;
}

const PrescriptionForm = ({ petId, appointmentUuid }: PrescriptionFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [medications, setMedications] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        const fetchMedications = async () => {
            try {
                const response = await getMedicationsList();
                if (!response.success) {
                    throw new Error(response.error || "Failed to fetch medications");
                }

                setMedications(
                    response.data.medication.map((med) => {
                        return {
                            id: med.medication_id,
                            name: med.name,
                        };
                    }),
                );
            } catch (error) {
                console.error("Error fetching medications:", error);
            }
        };

        fetchMedications();
    }, []);

    const form = useForm({
        resolver: zodResolver(PrescriptionFormSchema),
        defaultValues: {
            pet_id: petId,
            appointment_uuid: appointmentUuid,
            medication_id: undefined,
            dosage: "",
            frequency: "",
            start_date: new Date(),
            end_date: addDays(new Date(), 7),
            refills_remaining: 0,
        },
    });

    const onSubmit = async (data: PrescriptionType) => {
        setIsLoading(true);
        toast.loading("Issuing prescription...");
        const response = await addPrescription(data);
        if (response === undefined) {
            toast.dismiss();
            toast.success("Prescription issued successfully");
            form.reset();
            setIsLoading(false);
        } else {
            setIsLoading(false);
            toast.dismiss();
            toast.error(!response.success ? response.error : "Failed to issue prescription");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="medication_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Medication</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                                disabled={isLoading}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select medication" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {medications.map((med) => (
                                        <SelectItem key={med.id} value={med.id.toString()}>
                                            {med.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Select the medication to prescribe</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 10mg, 1 tablet" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>Amount of medication to take</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Twice daily, Every 8 hours"
                                        {...field}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormDescription>How often medication should be taken</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
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
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                                <FormDescription>When to start taking the medication</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
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
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < form.getValues("start_date")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>When to stop taking the medication</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="refills_remaining"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Refills</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>Number of prescription refills allowed</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Issuing..." : "Issue Prescription"}
                </Button>
            </form>
        </Form>
    );
};

export default PrescriptionForm;
