"use client";
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
} from "@/components/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema, SignUpType } from "@/schemas";
import { createAccount } from "@/actions";
import { toast } from "sonner";
import type { TextFormField } from "@/types/forms/text-form-field";
import { createFormConfig, toTitleCase } from "@/lib";

function UserSignUpForm() {
    const signUpFormField: TextFormField[] = [
        {
            label: "First Name",
            placeholder: "First Name",
            name: "first_name",
            description: "Your first name",
            required: true,
            autoComplete: "given-name",
            type: "text",
        },
        {
            label: "Last Name",
            placeholder: "Last Name",
            name: "last_name",
            description: "Your Last name",
            required: true,
            autoComplete: "family-name",
            type: "text",
        },
        {
            label: "Email",
            placeholder: "Email",
            name: "email",
            description: "Your valid email address",
            required: true,
            autoComplete: "email",
            type: "email",
        },
        {
            label: "Phone Number",
            placeholder: "Phone Number",
            name: "phone_number",
            description: "Your phone number",
            required: true,
            autoComplete: "tel",
            type: "tel",
        },
        {
            label: "Password",
            placeholder: "Password",
            name: "password",
            description: "Your password",
            required: true,
            autoComplete: "new-password",
            type: "password",
        },
        {
            label: "Confirm your password",
            placeholder: "Confirm Password",
            name: "confirm_password",
            description: "Retype your password",
            required: true,
            autoComplete: "new-password",
            type: "password",
        },
    ];
    const signUpForm = useForm<SignUpType>(
        createFormConfig({
            defaultValues: {
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                confirm_password: "",
                phone_number: "",
            },
            resolver: zodResolver(SignUpSchema),
        }),
    );
    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = signUpForm;

    const onSubmit = async (values: SignUpType) => {
        const t = toast.loading("Creating account...");
        const result = await createAccount(values);
        if (result === undefined) {
            toast.success("Account created successfully, please check the email's inbox for verification link.", {
                id: t,
            });
            signUpForm.reset();
            return;
        }
        if (result && !result.success) {
            toast.error(toTitleCase(result.error), { id: t });
            return;
        }
        toast.error("An unexpected error occurred", { id: t });
    };
    return (
        <Form {...signUpForm}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {signUpFormField.map((signUpFormField) => (
                        <FormField
                            key={signUpFormField.name}
                            control={control}
                            name={
                                signUpFormField.name as
                                    | "first_name"
                                    | "last_name"
                                    | "email"
                                    | "password"
                                    | "confirm_password"
                                    | "phone_number"
                            }
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel htmlFor={field.name}>{signUpFormField.label}</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            required={signUpFormField.required}
                                            id={field.name}
                                            type={signUpFormField.type}
                                            autoComplete={signUpFormField.autoComplete}
                                            placeholder={signUpFormField.placeholder}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>{signUpFormField.description}</FormDescription>
                                    <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <Button className="w-full mt-5">Create account</Button>
            </form>
        </Form>
    );
}

export default UserSignUpForm;
