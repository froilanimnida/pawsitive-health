"use client";
import { createMedication } from "@/actions/medications";
import { MedicineSchema, MedicineType } from "@/schemas/medicine-definition";
import { type TextFormField } from "@/types/forms/text-form-field";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const MedicineForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const medicineFormFields: TextFormField[] = [
        {
            label: "Name of Medicine",
            placeholder: "Enter medicine name",
            name: "name",
            description: "The name of the medicine.",
            required: true,
            autoComplete: "name",
            type: "text",
        },
        {
            label: "Description",
            placeholder: "Enter description",
            name: "description",
            description: "A brief description of the medicine.",
            required: true,
            autoComplete: "description",
            type: "text",
        },
        {
            label: "Usage Instructions",
            placeholder: "Enter usage instructions",
            name: "usage_instructions",
            description: "How to use the medicine.",
            required: true,
            autoComplete: "usage_instructions",
            type: "text",
        },
        {
            label: "Side Effects",
            placeholder: "Enter side effects",
            name: "side_effects",
            description: "Possible side effects of the medicine.",
            required: true,
            autoComplete: "side_effects",
            type: "text",
        },
    ];
    const medicineForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            usage_instructions: "",
            side_effects: "",
        },
        resolver: zodResolver(MedicineSchema),
        progressive: true,
        shouldFocusError: true,
        mode: "onBlur",
        reValidateMode: "onChange",
    });
    const onSubmit = async (values: MedicineType) => {
        setIsLoading(true);
        await toast
            .promise(createMedication(values), {
                success: "Successfully added new medicine",
                error: "Failed to add new medicine",
                loading: "Adding new medicine...",
            })
            .finally(() => {
                setIsLoading(false);
                medicineForm.reset();
            });
    };
    return (
        <Form {...medicineForm}>
            <form onSubmit={medicineForm.handleSubmit(onSubmit)} className="space-y-4">
                {medicineFormFields.map((medicineFormField) => (
                    <FormField
                        key={medicineFormField.name}
                        control={medicineForm.control}
                        name={medicineFormField.name as "name" | "description" | "usage_instructions" | "side_effects"}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>{medicineFormField.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type={medicineFormField.type}
                                        placeholder={medicineFormField.placeholder}
                                        autoComplete={medicineFormField.autoComplete}
                                        required={medicineFormField.required}
                                    />
                                </FormControl>
                                <FormDescription>{medicineFormField.description}</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                ))}
                <Button type="submit" disabled={isLoading}>
                    Add Medicine
                </Button>
            </form>
        </Form>
    );
};

export default MedicineForm;
