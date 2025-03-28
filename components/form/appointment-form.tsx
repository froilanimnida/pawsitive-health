"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormControl, Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { appointment_type, type clinics, type pets } from "@prisma/client";
import { AppointmentSchema } from "@/schemas/appointment-definition";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toTitleCase } from "@/lib/functions/text/title-case";
import { getVeterinariansByClinic } from "@/actions/veterinary";

interface NewAppointmentFields {
    label: string;
    placeholder: string;
    name: "status" | "notes";
    description: string;
    required: boolean;
}

interface NewAppointmentSelectFields {
    label: string;
    placeholder: string;
    name: "appointment_type" | "vet_id" | "pet_uuid" | "clinic_id";
    description: string;
    options: { label: string; value: string }[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    required: boolean;
}
interface PetWithStringWeight extends Omit<pets, "weight_kg"> {
    weight_kg: string;
}

const AppointmentForm = ({ params }: { params: { uuid: string; pets: PetWithStringWeight[]; clinics: clinics[] } }) => {
    const [selectedClinicId, setSelectedClinicId] = useState<string>("");
    const [veterinarians, setVeterinarians] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingVets, setIsLoadingVets] = useState<boolean>(false);

    // Load veterinarians when clinic changes
    useEffect(() => {
        const loadVeterinarians = async () => {
            if (!selectedClinicId) {
                setVeterinarians([]);
                return;
            }

            setIsLoadingVets(true);
            try {
                const vets = await getVeterinariansByClinic(selectedClinicId);
                setVeterinarians(
                    vets.map((vet) => ({
                        label: `${vet.name} (${toTitleCase(vet.specialization)})`,
                        value: vet.id,
                    })),
                );
            } catch (error) {
                console.error("Failed to load veterinarians:", error);
            } finally {
                setIsLoadingVets(false);
            }
        };

        loadVeterinarians();
    }, [selectedClinicId]);
    const newAppointmentFields: NewAppointmentFields[] = [
        {
            label: "Status",
            placeholder: "Status",
            name: "status",
            description: "The status of the appointment.",
            required: true,
        },
        {
            label: "Notes",
            placeholder: "Notes",
            name: "notes",
            description: "The notes of the appointment.",
            required: true,
        },
    ];
    const newAppointmentSelectFields: NewAppointmentSelectFields[] = [
        {
            label: "Clinic",
            placeholder: "Select Clinic",
            name: "clinic_id",
            description: "The clinic of the appointment.",
            options: params.clinics.map((clinic) => ({
                label: clinic.name,
                value: String(clinic.clinic_id),
            })),
            onChange: (value) => {
                newAppointmentForm.setValue("clinic_id", value);
                // Clear vet selection when clinic changes
                newAppointmentForm.setValue("vet_id", "");
                // Update selected clinic to trigger loading vets
                setSelectedClinicId(value);
            },
            required: true,
        },
        {
            label: "Veterinarian",
            placeholder: isLoadingVets ? "Loading veterinarians..." : "Select Veterinarian",
            name: "vet_id",
            description: "The veterinarian of the appointment.",
            options: veterinarians,
            onChange: (value) => newAppointmentForm.setValue("vet_id", value),
            required: true,
        },
        {
            label: "Pet",
            placeholder: "Pet",
            name: "pet_uuid",
            description: "The pet of the appointment.",
            options: params.pets.map((pet) => ({
                label: `${pet.name} (${pet.species})`,
                value: pet.pet_uuid,
            })),
            defaultValue: "Buddy",
            onChange: (value) => newAppointmentForm.setValue("pet_uuid", value),
            required: true,
        },
        {
            label: "Appointment Type",
            placeholder: "Appointment Type",
            name: "appointment_type",
            description: "The type of the appointment.",
            options: Object.values(appointment_type).map((type) => ({
                label: toTitleCase(type),
                value: type,
            })),
            defaultValue: appointment_type.behavioral_consultation,
            onChange: (value) => newAppointmentForm.setValue("appointment_type", value),
            required: true,
        },
    ];
    const newAppointmentForm = useForm({
        defaultValues: {
            status: "",
            notes: "",
            appointment_type: appointment_type.behavioral_consultation,
            vet_id: "",
            pet_uuid: params.uuid,
            clinic_id: "",
        },
        resolver: zodResolver(AppointmentSchema),
        progressive: true,
        shouldFocusError: true,
    });
    const onSubmit = (values: z.infer<typeof AppointmentSchema>) => {
        console.log(values);
    };
    return (
        <Form {...newAppointmentForm}>
            <form onSubmit={newAppointmentForm.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    name="appointment_date"
                    control={newAppointmentForm.control}
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Appointment Date</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "MM/dd/yyyy") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            required
                                            selected={field.value}
                                            onSelect={(date) => {
                                                if (!date) {
                                                    field.onChange(null);
                                                    return;
                                                }

                                                const dateOnly = new Date(
                                                    date.getFullYear(),
                                                    date.getMonth(),
                                                    date.getDate(),
                                                );

                                                field.onChange(dateOnly);
                                            }}
                                            initialFocus
                                            disabled={(date) => date < new Date()}
                                            className="bg-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormDescription>Enter the date of the appointment.</FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
                {newAppointmentFields.map((newAppointmentField) => {
                    return (
                        <FormField
                            key={newAppointmentField.name}
                            control={newAppointmentForm.control}
                            name={newAppointmentField.name}
                            render={({ field, fieldState }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>{newAppointmentField.label}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                required={newAppointmentField.required}
                                                type="text"
                                                placeholder={newAppointmentField.placeholder}
                                            />
                                        </FormControl>
                                        <FormDescription>{newAppointmentField.description}</FormDescription>
                                        <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                    </FormItem>
                                );
                            }}
                        />
                    );
                })}
                {newAppointmentSelectFields.map((newAppointmentSelectField) => (
                    <FormField
                        key={newAppointmentSelectField.name}
                        control={newAppointmentForm.control}
                        name={newAppointmentSelectField.name}
                        render={({ field, fieldState }) => {
                            const isVetField = newAppointmentSelectField.name === "vet_id";
                            const isDisabled = isVetField && (!selectedClinicId || isLoadingVets);
                            return (
                                <FormItem>
                                    <FormLabel>{newAppointmentSelectField.label}</FormLabel>
                                    <Select
                                        required={newAppointmentSelectField.required}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            if (newAppointmentSelectField.onChange)
                                                newAppointmentSelectField.onChange(value);
                                        }}
                                        value={field.value}
                                        defaultValue={field.value || newAppointmentSelectField.defaultValue}
                                        disabled={isDisabled}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingVets && isVetField
                                                            ? "Loading veterinarians..."
                                                            : field.value || "Select an option"
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {newAppointmentSelectField.options.length === 0 && isVetField ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                    {!selectedClinicId
                                                        ? "Please select a clinic first"
                                                        : isLoadingVets
                                                          ? "Loading veterinarians..."
                                                          : "No veterinarians found for this clinic"}
                                                </div>
                                            ) : (
                                                newAppointmentSelectField.options.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>{newAppointmentSelectField.description}</FormDescription>
                                    <FormMessage>{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            );
                        }}
                    />
                ))}
                <Button type="submit">Add Appointment</Button>
            </form>
        </Form>
    );
};

export default AppointmentForm;
