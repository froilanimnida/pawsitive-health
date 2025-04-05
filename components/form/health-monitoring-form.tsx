"use client";
import { HealthMonitoringSchema, HealthMonitoringType } from "@/schemas/health-monitoring";
import { type TextFormField } from "@/types/forms/text-form-field";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export const HealthMonitoringForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const healthMonitoringFields: TextFormField[] = [
        {
            label: "Activity Level",
            placeholder: "Enter activity level",
            name: "activity_level",
            description: "The activity level of the pet.",
            required: true,
            autoComplete: "activity_level",
            type: "text",
        },
        {
            label: "Weight (kg)",
            placeholder: "Enter weight in kg",
            name: "weight_kg",
            description: "The weight of the pet in kilograms.",
            required: true,
            autoComplete: "weight_kg",
            type: "number",
        },
        {
            label: "Temperature (°C)",
            placeholder: "Enter temperature in Celsius",
            name: "temperature_celsius",
            description: "The temperature of the pet in Celsius.",
            required: true,
            autoComplete: "temperature_celsius",
            type: "number",
        },
        {
            label: "Symptoms",
            placeholder: "Enter symptoms",
            name: "symptoms",
            description: "Any symptoms observed in the pet.",
            required: true,
            autoComplete: "symptoms",
            type: "text",
        },
        {
            label: "Notes",
            placeholder: "Enter additional notes",
            name: "notes",
            description: "Any additional notes or comments.",
            required: false,
            autoComplete: "notes",
            type: "text",
        },
    ];
    const healthMonitoringForm = useForm({
        defaultValues: {
            activity_level: "",
            weight_kg: 0,
            temperature_celsius: 37.0,
            symptoms: "",
            notes: "",
        },
        resolver: zodResolver(HealthMonitoringSchema),
    });
    const { handleSubmit, control } = healthMonitoringForm;
    const onSubmit = async (data: HealthMonitoringType) => {
        setIsLoading(true);
        try {
            toast.success("Health monitoring data saved successfully");
        } catch {
            toast.error("Failed to save health monitoring data");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Form {...healthMonitoringForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {healthMonitoringFields.map((healthMonitoringField) => (
                    <FormField
                        key={healthMonitoringField.name}
                        control={control}
                        name={
                            healthMonitoringField.name as
                                | "weight_kg"
                                | "temperature_celsius"
                                | "activity_level"
                                | "symptoms"
                                | "notes"
                        }
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>{healthMonitoringField.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type={healthMonitoringField.type}
                                        placeholder={healthMonitoringField.placeholder}
                                        autoComplete={healthMonitoringField.autoComplete}
                                        required={healthMonitoringField.required}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormDescription>{healthMonitoringField.description}</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                ))}
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save"}
                </Button>
            </form>
        </Form>
    );
};
