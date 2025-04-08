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
    Input,
    Button,
    FormDescription,
} from "@/components/ui";
import { updatePet } from "@/actions";
import { UpdatePetSchema, type UpdatePetType } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const EditPetForm = ({ petName, weightKg, petUuid }: { petName: string; weightKg: number; petUuid: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const editPetForm = useForm({
        defaultValues: {
            name: petName,
            weight_kg: weightKg,
            pet_uuid: petUuid,
        },
        resolver: zodResolver(UpdatePetSchema),
        reValidateMode: "onChange",
        shouldFocusError: true,
        progressive: true,
    });

    const handleSubmit = async (values: UpdatePetType) => {
        setIsLoading(true);
        const t = toast.loading("Updating pet...");
        const result = await updatePet(values);
        if (result === undefined) {
            setIsLoading(false);
            toast.dismiss(t);
            toast.success("Pet updated successfully");
            return;
        }
        setIsLoading(false);
        toast.error("An error occurred while updating the pet");
    };

    return (
        <Form {...editPetForm}>
            <form onSubmit={editPetForm.handleSubmit(handleSubmit)} className="space-y-4 w-full">
                <FormField
                    control={editPetForm.control}
                    name="name"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Pet Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter pet name" {...field} />
                            </FormControl>
                            <FormDescription>
                                The name of your pet. This will be used for identification.
                            </FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={editPetForm.control}
                    name="weight_kg"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter weight in kg" {...field} />
                            </FormControl>
                            <FormDescription>
                                The weight of your pet in kilograms. Please enter a positive number.
                            </FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} className="w-full mt-4">
                    {isLoading ? "Updating..." : "Update Pet"}
                </Button>
            </form>
        </Form>
    );
};

export default EditPetForm;
