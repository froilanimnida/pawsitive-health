"use client";
import {
    Button,
    Checkbox,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Label,
    Separator,
} from "@/components/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewClinicAccountSchema, NewClinicAccountType } from "@/schemas";
import { toast } from "sonner";
import { createClinicAccount } from "@/actions";
import { OperatingHoursField } from "./operating-hours-field";
import type { TextFormField } from "@/types/forms/text-form-field";
import { createFormConfig } from "@/lib";

const ClinicSignUp = () => {
    const clinicSignUpFields: TextFormField[] = [
        {
            label: "Clinic Name",
            placeholder: "Clinic Name",
            name: "name",
            description: "The name of your clinic.",
            required: true,
            autoComplete: "organization",
            type: "text",
        },
        {
            label: "Address",
            placeholder: "Address",
            name: "address",
            description: "The address of your clinic.",
            required: true,
            autoComplete: "street-address",
            type: "text",
        },
        {
            label: "City",
            placeholder: "City",
            name: "city",
            description: "The city where your clinic is located.",
            required: true,
            autoComplete: "address-level2",
            type: "text",
        },
        {
            label: "State",
            placeholder: "State",
            name: "state",
            description: "The state where your clinic is located.",
            required: true,
            autoComplete: "address-level1",
            type: "text",
        },
        {
            label: "Postal Code",
            placeholder: "Postal Code",
            name: "postal_code",
            description: "The postal code of your clinic.",
            required: true,
            autoComplete: "postal-code",
            type: "text",
        },
        {
            label: "Phone Number",
            placeholder: "Phone Number",
            name: "phone_number",
            description: "The phone number of your clinic.",
            required: true,
            autoComplete: "tel",
            type: "tel",
        },
        {
            label: "First Name",
            placeholder: "First Name",
            name: "first_name",
            description: "The first name of the clinic owner.",
            required: true,
            autoComplete: "given-name",
            type: "text",
        },
        {
            label: "Last Name",
            placeholder: "Last Name",
            name: "last_name",
            description: "The last name of the clinic owner.",
            required: true,
            autoComplete: "family-name",
            type: "text",
        },
        {
            label: "Email",
            placeholder: "Email",
            name: "email",
            description: "The email of the clinic owner.",
            required: true,
            autoComplete: "email",
            type: "email",
        },
        {
            label: "Website",
            placeholder: "Website",
            name: "website",
            description: "The website of the clinic.",
            required: false,
            autoComplete: "url",
            type: "url",
        },
        {
            label: "Google Maps URL",
            placeholder: "Google Maps URL",
            name: "google_maps_url",
            description: "The Google Maps URL of the clinic.",
            required: false,
            autoComplete: "url",
            type: "url",
        },
        {
            label: "Latitude",
            placeholder: "Latitude",
            name: "latitude",
            description: "The latitude of the clinic.",
            required: false,
            autoComplete: "latitude",
            type: "number",
        },
        {
            label: "Longitude",
            placeholder: "Longitude",
            name: "longitude",
            description: "The longitude of the clinic.",
            required: false,
            autoComplete: "longitude",
            type: "number",
        },
        {
            label: "Password",
            placeholder: "Password",
            name: "password",
            description: "The password of the clinic owner.",
            required: true,
            autoComplete: "new-password",
            type: "password",
        },
        {
            label: "Confirm Password",
            placeholder: "Confirm Password",
            name: "confirm_password",
            description: "Confirm the password of the clinic owner.",
            required: true,
            autoComplete: "new-password",
            type: "password",
        },
    ];
    const clinicSignUpForm = useForm<NewClinicAccountType>(
        createFormConfig({
            defaultValues: {
                name: "",
                address: "",
                city: "",
                state: "",
                postal_code: "",
                phone_number: "",
                emergency_services: false,
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                confirm_password: "",
                operating_hours: Array(7)
                    .fill(0)
                    .map((_, i) => ({
                        day_of_week: i,
                        opens_at: "09:00",
                        closes_at: "17:00",
                        is_closed: i === 0 || i === 6,
                    })),
                website: "",
                google_maps_url: "",
                latitude: 0,
                longitude: 0,
            },
            resolver: zodResolver(NewClinicAccountSchema),
        }),
    );
    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = clinicSignUpForm;
    const onSubmit = (values: NewClinicAccountType) => {
        toast.promise(createClinicAccount(values), {
            loading: "Creating account...",
            success: "Successfully created account",
            error: (error) => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes("email_or_phone_number_already_exists")) {
                    return "Email or phone number already exists";
                }
                return errorMessage;
            },
        });
    };
    return (
        <Form {...clinicSignUpForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {clinicSignUpFields.map((csf) => (
                        <FormField
                            key={csf.name}
                            control={control}
                            name={
                                csf.name as
                                    | "name"
                                    | "address"
                                    | "city"
                                    | "state"
                                    | "postal_code"
                                    | "phone_number"
                                    | "first_name"
                                    | "last_name"
                                    | "email"
                                    | "password"
                                    | "confirm_password"
                                    | "website"
                                    | "google_maps_url"
                            }
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>{csf.label}</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            required={csf.required}
                                            type={csf.type}
                                            autoComplete={csf.autoComplete}
                                            placeholder={csf.placeholder}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>{csf.description}</FormDescription>
                                    <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    ))}
                    <FormField
                        name="emergency_services"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Emergency Services</FormLabel>
                                <FormControl>
                                    <div className="flex items-center">
                                        <Checkbox disabled={isSubmitting} required {...field} />
                                        <Label className="ml-2">Do you provide emergency services?</Label>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>
                <Separator />
                <OperatingHoursField />
                <Button type="submit">Sign Up</Button>
            </form>
        </Form>
    );
};

export default ClinicSignUp;
