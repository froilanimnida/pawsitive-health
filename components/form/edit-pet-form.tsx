"use client";
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
import { createFormConfig } from "@/lib";

const EditPetForm = ({ petName, weightKg, petId }: { petName: string; weightKg: number; petId: number }) => {
    const editPetForm = useForm<UpdatePetType>(
        createFormConfig({
            defaultValues: {
                name: petName,
                weight_kg: weightKg,
                pet_id: petId,
            },
            resolver: zodResolver(UpdatePetSchema),
        }),
    );

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = editPetForm;

    const onSubmit = async (values: UpdatePetType) => {
        console.log("Form values:", values);
        const t = toast.loading("Updating pet...");
        const result = await updatePet(values);
        toast.dismiss(t);

        if (!result) {
            toast.success("Pet updated successfully");
            return;
        }
        toast.error("An error occurred while updating the pet");
    };

    return (
        <Form {...editPetForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
                <FormField
                    control={control}
                    name="name"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Pet Name</FormLabel>
                            <FormControl>
                                <Input disabled={isSubmitting} placeholder="Enter pet name" {...field} />
                            </FormControl>
                            <FormDescription>
                                The name of your pet. This will be used for identification.
                            </FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="weight_kg"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={isSubmitting}
                                    type="number"
                                    placeholder="Enter weight in kg"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                The weight of your pet in kilograms. Please enter a positive number.
                            </FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
                    {isSubmitting ? "Updating..." : "Update Pet"}
                </Button>
            </form>
        </Form>
    );
};

export default EditPetForm;
