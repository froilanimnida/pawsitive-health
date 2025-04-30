"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VeterinarianSchema, VeterinarianType } from "@/schemas";
import {
    Form,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectValue,
    SelectTrigger,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    Input,
    FormDescription,
    FormMessage,
    Button,
} from "@/components/ui";
import { veterinary_specialization } from "@prisma/client";
import type { TextFormField } from "@/types/forms/text-form-field";
import { createFormConfig, toTitleCase } from "@/lib";
import { toast } from "sonner";
import { newVeterinarian } from "@/actions";

const NewVeterinaryForm = () => {
    const newVetFields: TextFormField[] = [
        {
            label: "First Name",
            placeholder: "First Name",
            name: "first_name",
            description: "The first name of the veterinarian.",
            required: true,
            type: "text",
        },
        {
            label: "Last Name",
            placeholder: "Last Name",
            name: "last_name",
            description: "The last name of the veterinarian.",
            required: true,
            type: "text",
        },
        {
            label: "Email",
            placeholder: "Email",
            name: "email",
            description: "The email of the veterinarian.",
            required: true,
            type: "email",
        },
        {
            label: "Phone Number",
            placeholder: "Phone Number",
            name: "phone_number",
            description: "The phone number of the veterinarian.",
            required: true,
            type: "tel",
        },
        {
            label: "Password",
            placeholder: "Password",
            name: "password",
            description: "The password of the veterinarian.",
            required: true,
            type: "password",
        },
        {
            label: "Confirm Password",
            placeholder: "Confirm Password",
            name: "confirm_password",
            description: "Confirm the password of the veterinarian.",
            required: true,
            type: "password",
        },
        {
            label: "License Number",
            placeholder: "License Number",
            name: "license_number",
            description: "The license number of the veterinarian.",
            required: true,
            type: "text",
        },
    ];

    const newVeterinaryForm = useForm<VeterinarianType>(
        createFormConfig({
            resolver: zodResolver(VeterinarianSchema),
            defaultValues: {
                first_name: "",
                last_name: "",
                email: "",
                phone_number: "",
                password: "",
                confirm_password: "",
                license_number: "",
                specialization: veterinary_specialization.general_practitioner,
            },
        }),
    );
    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = newVeterinaryForm;

    const onSubmit = async (values: VeterinarianType) => {
        toast.promise(newVeterinarian(values), {
            loading: "Creating a new veterinarian...",
            success: "Successfully created a new veterinarian",
            error: "Failed to create a new veterinarian",
        });
    };
    return (
        <Form {...newVeterinaryForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {newVetFields.map((newVetField) => (
                    <FormField
                        control={control}
                        key={newVetField.name}
                        name={
                            newVetField.name as
                                | "first_name"
                                | "last_name"
                                | "email"
                                | "phone_number"
                                | "password"
                                | "confirm_password"
                                | "license_number"
                                | "specialization"
                        }
                        render={({ field, fieldState }) => {
                            return (
                                <FormItem>
                                    <FormLabel>{newVetField.label}</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            {...field}
                                            type={newVetField.type}
                                            required={newVetField.required}
                                            placeholder={newVetField.placeholder}
                                            name={newVetField.name}
                                        />
                                    </FormControl>
                                    <FormDescription>{newVetField.description}</FormDescription>
                                    <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            );
                        }}
                    />
                ))}
                <FormField
                    name="specialization"
                    render={({ field, fieldState }) => {
                        return (
                            <FormItem>
                                <FormLabel>Specialization</FormLabel>
                                <FormControl>
                                    <Select
                                        disabled={isSubmitting}
                                        defaultValue={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue>{field.value || "Select a specialization"}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Specialization</SelectLabel>
                                                {Object.values(veterinary_specialization).map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {toTitleCase(option)}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        );
                    }}
                />
                <Button disabled={isSubmitting} type="submit">
                    Submit
                </Button>
            </form>
        </Form>
    );
};

export default NewVeterinaryForm;
