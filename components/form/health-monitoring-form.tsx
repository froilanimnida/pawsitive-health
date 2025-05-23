"use client";
import { HealthMonitoringSchema, type HealthMonitoringType } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createFormConfig, toTitleCase } from "@/lib";
import { activity_level } from "@prisma/client";

export const HealthMonitoringForm = ({
    petId,
    petUuid,
    currentWeight,
    onCancel,
}: {
    petId: number;
    petUuid: string;
    currentWeight: number;
    onCancel?: () => void;
}) => {
    const healthMonitoringForm = useForm<HealthMonitoringType>(
        createFormConfig({
            defaultValues: {
                activity_level: activity_level.normal,
                weight_kg: currentWeight,
                temperature_celsius: 37.0,
                symptoms: "",
                notes: "",
                pet_id: petId,
                pet_uuid: petUuid,
            },
            resolver: zodResolver(HealthMonitoringSchema),
        }),
    );
    const {
        control,
        reset,
        formState: { isSubmitting },
        handleSubmit,
    } = healthMonitoringForm;

    const onSubmit = async (data: HealthMonitoringType) => {
        try {
            const result = await addHealthMonitoringRecord(data);

            if (result && !result.success) {
                toast.error(result.error || "Failed to save health monitoring data");
                return;
            }

            toast.success("Health monitoring data saved successfully");
            reset();
        } catch {
            toast.error("Failed to save health monitoring data");
        }
    };

    return (
        <Form {...healthMonitoringForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={control}
                    name="activity_level"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Activity Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select activity level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.values(activity_level).map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {toTitleCase(option)}
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
                        control={control}
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
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormDescription>The weight of your pet in kilograms</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
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
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormDescription>The temperature of your pet in Celsius</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name="symptoms"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Symptoms</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe any symptoms or changes in behavior"
                                    className="min-h-[80px]"
                                    {...field}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormDescription>Any symptoms or changes in behavior you&apos;ve observed</FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Any additional notes or observations"
                                    className="min-h-[80px]"
                                    {...field}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormDescription>
                                Any other relevant information about your pet&apos;s health
                            </FormDescription>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Health Record"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
