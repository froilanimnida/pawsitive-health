"use client";
import { HealthMonitoringSchema, type HealthMonitoringType } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Button,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from "@/components/ui";
import { toast } from "sonner";
import { addHealthMonitoringRecord } from "@/actions";

interface HealthMonitoringFormProps {
    petId: number;
    petUuid: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const HealthMonitoringForm = ({ petId, petUuid, onSuccess, onCancel }: HealthMonitoringFormProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const activityLevelOptions = [
        { value: "very_low", label: "Very Low" },
        { value: "low", label: "Low" },
        { value: "normal", label: "Normal" },
        { value: "high", label: "High" },
        { value: "very_high", label: "Very High" },
    ];

    const form = useForm<HealthMonitoringType>({
        defaultValues: {
            activity_level: "",
            weight_kg: 0,
            temperature_celsius: 37.0,
            symptoms: "",
            notes: "",
        },
        resolver: zodResolver(HealthMonitoringSchema),
    });

    const onSubmit = async (data: HealthMonitoringType) => {
        setIsLoading(true);
        try {
            const result = await addHealthMonitoringRecord({
                ...data,
                pet_id: petId,
                pet_uuid: petUuid,
            });

            if (result && !result.success) {
                toast.error(result.error || "Failed to save health monitoring data");
                setIsLoading(false);
                return;
            }

            toast.success("Health monitoring data saved successfully");
            form.reset();
            if (onSuccess) onSuccess();
        } catch {
            toast.error("Failed to save health monitoring data");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="activity_level"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Activity Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select activity level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {activityLevelOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>The current activity level of your pet</FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="weight_kg"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Weight (kg)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter weight in kg"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormDescription>The weight of your pet in kilograms</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="temperature_celsius"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Temperature (°C)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="Enter temperature in Celsius"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormDescription>The temperature of your pet in Celsius</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Symptoms</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe any symptoms or changes in behavior"
                                    className="min-h-[80px]"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>Any symptoms or changes in behavior you&apos;ve observed</FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Any additional notes or observations"
                                    className="min-h-[80px]"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>
                                Any other relevant information about your pet&apos;s health
                            </FormDescription>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Health Record"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
