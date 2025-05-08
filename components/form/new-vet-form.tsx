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
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Switch,
} from "@/components/ui";
import { useState } from "react";
import { veterinary_specialization, type clinic_hours } from "@prisma/client";
import type { TextFormField } from "@/types/forms/text-form-field";
import { createFormConfig, toTitleCase } from "@/lib";
import { toast } from "sonner";
import { newVeterinarian } from "@/actions";

interface TimeSlot {
    day: number;
    dayName: string;
    start: string;
    end: string;
    isAvailable: boolean;
}

const NewVeterinaryForm = ({ initialClinicHours }: { initialClinicHours: clinic_hours[] }) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const initialSchedule: TimeSlot[] = dayNames.map((dayName, index) => {
        const clinicHour = initialClinicHours.find((hour) => hour.day_of_week === index);

        // Default values if clinic hours not found
        let defaultStart = "09:00";
        let defaultEnd = "17:00";
        let isClosed = false;

        if (clinicHour) {
            // Handle UTC date format from clinic hours
            const opensAt = new Date(clinicHour.opens_at);
            const closesAt = new Date(clinicHour.closes_at);

            // Get just the hours and minutes in local time
            defaultStart = `${opensAt.getUTCHours().toString().padStart(2, "0")}:${opensAt.getUTCMinutes().toString().padStart(2, "0")}`;
            defaultEnd = `${closesAt.getUTCHours().toString().padStart(2, "0")}:${closesAt.getUTCMinutes().toString().padStart(2, "0")}`;
            isClosed = clinicHour.is_closed;
        }

        return {
            day: index,
            dayName,
            start: defaultStart,
            end: defaultEnd,
            isAvailable: !isClosed,
        };
    });

    const [vetSchedule, setVetSchedule] = useState<TimeSlot[]>(initialSchedule);

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
                veterinary_availability: initialSchedule.map((slot) => ({
                    day_of_week: slot.day,
                    start_time: slot.start,
                    end_time: slot.end,
                    is_available: slot.isAvailable,
                })),
            },
        }),
    );
    const {
        handleSubmit,
        control,
        setValue,
        formState: { isSubmitting },
    } = newVeterinaryForm;

    const onSubmit = async (values: VeterinarianType) => {
        toast.promise(newVeterinarian(values), {
            loading: "Creating veterinarian...",
            success: "Successfully created veterinarian",
            error: (error) => {
                if (error instanceof Error) {
                    return error.message;
                }
                return "Failed to create veterinarian";
            },
        });
    };

    const handleScheduleChange = (index: number, field: keyof TimeSlot, value: string | boolean) => {
        const updatedSchedule = vetSchedule.map((slot, idx) => (idx === index ? { ...slot, [field]: value } : slot));
        setVetSchedule(updatedSchedule);
        setValue(
            "veterinary_availability",
            updatedSchedule.map((slot) => ({
                day_of_week: slot.day,
                start_time: slot.start,
                end_time: slot.end,
                is_available: slot.isAvailable,
            })),
        );
    };

    return (
        <Form {...newVeterinaryForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Tabs className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="personal">Personal Information</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {newVetFields.map((nvff) => (
                                <FormField
                                    control={control}
                                    key={nvff.name}
                                    name={
                                        nvff.name as
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
                                                <FormLabel>{nvff.label}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        disabled={isSubmitting}
                                                        {...field}
                                                        type={nvff.type}
                                                        required={nvff.required}
                                                        placeholder={nvff.placeholder}
                                                        name={nvff.name}
                                                    />
                                                </FormControl>
                                                <FormDescription>{nvff.description}</FormDescription>
                                                <FormMessage className="text-red-500">
                                                    {fieldState.error?.message}
                                                </FormMessage>
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
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue>
                                                            {toTitleCase(field.value) || "Select a specialization"}
                                                        </SelectValue>
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
                                            <FormDescription>
                                                Select the specialization of the veterinarian.
                                            </FormDescription>
                                            <FormMessage>{fieldState.error?.message}</FormMessage>
                                        </FormItem>
                                    );
                                }}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-4 mt-4">
                        <Card className="shadow-none border">
                            <CardHeader>
                                <CardTitle className="text-lg">Veterinarian Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Configure when this veterinarian is available for appointments. Schedule must be
                                    within clinic hours.
                                </p>

                                <div className="space-y-4">
                                    {vetSchedule.map((slot, index) => (
                                        <div key={index} className="flex flex-col items-start gap-3 border-b pb-3 ">
                                            <FormLabel className="font-medium">{slot.dayName}</FormLabel>
                                            <div className="flex flex-row gap-4 w-full justify-around">
                                                <div className="col-span-1 text-center gap-3 flex flex-col">
                                                    <FormLabel htmlFor={`available-${slot.day}`} className="mr-2">
                                                        Available
                                                    </FormLabel>
                                                    <Switch
                                                        id={`available-${slot.day}`}
                                                        checked={slot.isAvailable}
                                                        onCheckedChange={(checked) =>
                                                            handleScheduleChange(index, "isAvailable", checked)
                                                        }
                                                        disabled={
                                                            isSubmitting ||
                                                            (initialClinicHours[index]?.is_closed ?? false)
                                                        }
                                                    />
                                                </div>
                                                <div className="col-span-2 flex flex-col flex-start gap-3">
                                                    <FormLabel htmlFor={`start-${slot.day}`}>Start Time</FormLabel>
                                                    <Input
                                                        id={`start-${slot.day}`}
                                                        type="time"
                                                        value={slot.start}
                                                        onChange={(e) => {
                                                            const selectedTime = e.target.value;
                                                            const clinicHour = initialClinicHours.find(
                                                                (hour) => hour.day_of_week === slot.day,
                                                            );
                                                            if (clinicHour) {
                                                                const opensAt = new Date(clinicHour.opens_at);
                                                                const clinicStart = `${opensAt.getUTCHours().toString().padStart(2, "0")}:${opensAt.getUTCMinutes().toString().padStart(2, "0")}`;
                                                                // Only update if time is valid
                                                                if (selectedTime >= clinicStart) {
                                                                    handleScheduleChange(index, "start", selectedTime);
                                                                } else {
                                                                    // Reset to clinic opening time if invalid
                                                                    handleScheduleChange(index, "start", clinicStart);
                                                                    toast.error(
                                                                        `Start time must be after clinic opening hours (${clinicStart})`,
                                                                    );
                                                                }
                                                            } else {
                                                                handleScheduleChange(index, "start", selectedTime);
                                                            }
                                                        }}
                                                        min={
                                                            initialClinicHours
                                                                ? `${new Date(initialClinicHours[index].opens_at).getUTCHours().toString().padStart(2, "0")}:${new Date(initialClinicHours[index].opens_at).getUTCMinutes().toString().padStart(2, "0")}`
                                                                : "09:00"
                                                        }
                                                        max={
                                                            initialClinicHours
                                                                ? `${new Date(initialClinicHours[index].closes_at).getUTCHours().toString().padStart(2, "0")}:${new Date(initialClinicHours[index].closes_at).getUTCMinutes().toString().padStart(2, "0")}`
                                                                : "17:00"
                                                        }
                                                        disabled={
                                                            isSubmitting ||
                                                            !slot.isAvailable ||
                                                            (initialClinicHours[index]?.is_closed ?? false)
                                                        }
                                                    />
                                                </div>
                                                <div className="col-span-2 flex flex-col flex-start gap-3">
                                                    <FormLabel htmlFor={`end-${slot.day}`}>End Time</FormLabel>
                                                    <Input
                                                        id={`end-${slot.day}`}
                                                        type="time"
                                                        value={slot.end}
                                                        onChange={(e) => {
                                                            const selectedTime = e.target.value;
                                                            const clinicHour = initialClinicHours.find(
                                                                (hour) => hour.day_of_week === slot.day,
                                                            );
                                                            if (clinicHour) {
                                                                const closesAt = new Date(clinicHour.closes_at);
                                                                const clinicEnd = `${closesAt.getUTCHours().toString().padStart(2, "0")}:${closesAt.getUTCMinutes().toString().padStart(2, "0")}`;
                                                                if (
                                                                    selectedTime <= clinicEnd &&
                                                                    selectedTime > slot.start
                                                                ) {
                                                                    handleScheduleChange(index, "end", selectedTime);
                                                                } else if (selectedTime <= slot.start) {
                                                                    toast.error(`End time must be after start time`);
                                                                } else {
                                                                    // Reset to clinic closing time if invalid
                                                                    handleScheduleChange(index, "end", clinicEnd);
                                                                    toast.error(
                                                                        `End time must be before clinic closing hours (${clinicEnd})`,
                                                                    );
                                                                }
                                                            } else {
                                                                handleScheduleChange(index, "end", selectedTime);
                                                            }
                                                        }}
                                                        min={slot.start}
                                                        max={
                                                            initialClinicHours
                                                                ? `${new Date(initialClinicHours[index].closes_at).getUTCHours().toString().padStart(2, "0")}:${new Date(initialClinicHours[index].closes_at).getUTCMinutes().toString().padStart(2, "0")}`
                                                                : "17:00"
                                                        }
                                                        disabled={
                                                            isSubmitting ||
                                                            !slot.isAvailable ||
                                                            (initialClinicHours[index]?.is_closed ?? false)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            {initialClinicHours[index]?.is_closed && (
                                                <div className="col-span-6 text-sm text-amber-600">
                                                    Note: Clinic is closed on {slot.dayName}s
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-between">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default NewVeterinaryForm;
