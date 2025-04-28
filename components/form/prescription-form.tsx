"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Calendar,
    Switch,
    Separator,
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui";
import { PrescriptionDefinition, type PrescriptionType, type TimeSlotType } from "@/schemas/prescription-definition";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { addPrescription } from "@/actions";
import { medications, prescription_schedule_type } from "@prisma/client";
import { createFormConfig } from "@/lib/config/hook-form-config";
import TimeSlotEditor from "./time-slot-editor";
import { toTitleCase } from "@/lib";

interface PrescriptionFormProps {
    petId: number;
    petUuid?: string;
    appointmentUuid?: string;
    appointmentId?: number;
    vetId?: number;
    isCheckIn?: boolean;
    medicationList: medications[] | [];
    petName?: string;
}

// Default time slots based on frequency
const DEFAULT_TIME_SLOTS: Record<prescription_schedule_type, TimeSlotType[]> = {
    [prescription_schedule_type.once_daily]: [{ hour: 9, minute: 0, enabled: true }],
    [prescription_schedule_type.twice_daily]: [
        { hour: 9, minute: 0, enabled: true },
        { hour: 21, minute: 0, enabled: true },
    ],
    [prescription_schedule_type.three_times_daily]: [
        { hour: 8, minute: 0, enabled: true },
        { hour: 14, minute: 0, enabled: true },
        { hour: 20, minute: 0, enabled: true },
    ],
    [prescription_schedule_type.four_times_daily]: [
        { hour: 8, minute: 0, enabled: true },
        { hour: 12, minute: 0, enabled: true },
        { hour: 16, minute: 0, enabled: true },
        { hour: 20, minute: 0, enabled: true },
    ],
    [prescription_schedule_type.every_other_day]: [{ hour: 9, minute: 0, enabled: true }],
    [prescription_schedule_type.weekly]: [{ hour: 9, minute: 0, enabled: true }],
    [prescription_schedule_type.as_needed]: [],
    [prescription_schedule_type.custom]: [],
};

const PrescriptionForm = ({
    petId,
    petUuid,
    appointmentUuid,
    appointmentId,
    vetId,
    isCheckIn = true,
    medicationList,
    petName = "your pet",
}: PrescriptionFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [scheduleType, setScheduleType] = useState<prescription_schedule_type | undefined>();
    const [selectedMedication, setSelectedMedication] = useState<string>("");

    const form = useForm<PrescriptionType>(
        createFormConfig({
            resolver: zodResolver(PrescriptionDefinition),
            defaultValues: {
                pet_id: petId,
                pet_uuid: petUuid,
                appointment_uuid: appointmentUuid,
                appointment_id: appointmentId,
                vet_id: vetId,
                medication_id: undefined,
                dosage: "",
                frequency: "",
                schedule_type: undefined,
                time_slots: [],
                add_to_calendar: false,
                calendar_sync_enabled: false,
                reminder_minutes_before: 15,
                start_date: new Date(),
                end_date: addDays(new Date(), 7),
                refills_remaining: 0,
                custom_instructions: "",
            },
        }),
    );
    console.log(petName);

    // When schedule type changes, update the time slots
    useEffect(() => {
        if (scheduleType) {
            const defaultSlots = DEFAULT_TIME_SLOTS[scheduleType];
            form.setValue("time_slots", defaultSlots);

            // Update frequency field for better compatibility with existing code
            const frequencyText = toTitleCase(scheduleType);
            form.setValue("frequency", frequencyText);

            // If as_needed, we don't need calendar integration
            if (scheduleType === prescription_schedule_type.as_needed) {
                form.setValue("add_to_calendar", false);
                form.setValue("calendar_sync_enabled", false);
            }
        }
    }, [scheduleType, form]);

    // Update medication name when selection changes
    useEffect(() => {
        if (selectedMedication) {
            const medication = medicationList.find((med) => med.medication_id.toString() === selectedMedication);
            if (medication) {
                // Update frequency description using medication details
                const frequencyText = form.getValues("frequency");
                const dosageText = form.getValues("dosage");
                if (dosageText) {
                    const description = `${medication.name} ${dosageText} ${frequencyText}`;
                    form.setValue("custom_schedule_description", description);
                }
            }
        }
    }, [selectedMedication, form, medicationList]);

    const onSubmit = async (data: PrescriptionType) => {
        try {
            setIsLoading(true);
            toast.loading("Issuing prescription...");

            // Handle the medication_id conversion
            const prescriptionData = {
                ...data,
                medication_id:
                    typeof data.medication_id === "string" ? parseInt(data.medication_id, 10) : data.medication_id,
                refills_remaining: Number(data.refills_remaining),
                calendar_sync_enabled: data.add_to_calendar, // Map the UI field to DB field
            };

            const response = await addPrescription(prescriptionData);

            if (response === undefined) {
                toast.dismiss();
                toast.success("Prescription issued successfully");
                form.reset({
                    ...form.getValues(),
                    medication_id: undefined,
                    dosage: "",
                    frequency: "",
                    schedule_type: undefined,
                    time_slots: [],
                    add_to_calendar: false,
                    calendar_sync_enabled: false,
                    start_date: new Date(),
                    end_date: addDays(new Date(), 7),
                    refills_remaining: 0,
                    custom_instructions: "",
                });
                setSelectedMedication("");
                setScheduleType(undefined);
                return;
            }

            if (response.success === false) {
                toast.dismiss();
                toast.error(response.error || "Failed to issue prescription");
                return;
            }

            toast.dismiss();
            toast.error("An unexpected error occurred");
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to issue prescription");
            console.error("Prescription error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isCheckIn) {
        return (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <h3 className="font-medium text-lg mb-2">Patient Check-in Required</h3>
                <p>
                    You can only issue prescriptions for patients who have checked in for their appointment. Please
                    check in the patient first.
                </p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="medication_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Medication</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedMedication(value);
                                }}
                                value={field.value?.toString()}
                                disabled={isLoading}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select medication" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {medicationList.map((med) => (
                                        <SelectItem key={med.medication_id} value={med.medication_id.toString()}>
                                            {med.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Select the medication to prescribe</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 10mg, 1 tablet" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>Amount of medication to take</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="schedule_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Schedule Type</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setScheduleType(value as prescription_schedule_type);
                                    }}
                                    value={field.value}
                                    disabled={isLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={prescription_schedule_type.once_daily}>
                                            Once Daily
                                        </SelectItem>
                                        <SelectItem value={prescription_schedule_type.twice_daily}>
                                            Twice Daily
                                        </SelectItem>
                                        <SelectItem value={prescription_schedule_type.three_times_daily}>
                                            Three Times Daily
                                        </SelectItem>
                                        <SelectItem value={prescription_schedule_type.four_times_daily}>
                                            Four Times Daily
                                        </SelectItem>
                                        <SelectItem value={prescription_schedule_type.every_other_day}>
                                            Every Other Day
                                        </SelectItem>
                                        <SelectItem value={prescription_schedule_type.weekly}>Weekly</SelectItem>
                                        <SelectItem value={prescription_schedule_type.as_needed}>
                                            As Needed (PRN)
                                        </SelectItem>
                                        <SelectItem value={prescription_schedule_type.custom}>
                                            Custom Schedule
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>How often the medication should be taken</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {scheduleType && scheduleType !== prescription_schedule_type.as_needed && (
                    <FormField
                        control={form.control}
                        name="time_slots"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Administration Times</FormLabel>
                                <FormControl>
                                    <TimeSlotEditor
                                        value={field.value || []}
                                        onChange={field.onChange}
                                        disabled={isLoading || scheduleType !== prescription_schedule_type.custom}
                                        maxSlots={scheduleType === prescription_schedule_type.custom ? 10 : undefined}
                                    />
                                </FormControl>
                                {scheduleType === prescription_schedule_type.custom && (
                                    <FormDescription>
                                        Add specific times when the medication should be taken
                                    </FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="custom_instructions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Additional Instructions</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Take with food, Take on empty stomach"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>Special instructions for taking this medication</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                                disabled={isLoading}
                                                type="button"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>When to start taking the medication</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                                disabled={isLoading}
                                                type="button"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < form.getValues("start_date")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>When to stop taking the medication</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="refills_remaining"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Refills</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    disabled={isLoading}
                                    value={field.value}
                                />
                            </FormControl>
                            <FormDescription>Number of prescription refills allowed</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator className="my-4" />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Calendar Integration</h3>

                    <FormField
                        control={form.control}
                        name="add_to_calendar"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Add to Google Calendar</FormLabel>
                                    <FormDescription>Create reminders in the patient&apos;s calendar</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading || scheduleType === prescription_schedule_type.as_needed}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {form.watch("add_to_calendar") && (
                        <FormField
                            control={form.control}
                            name="reminder_minutes_before"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reminder Time</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            defaultValue={field.value?.toString()}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="0" />
                                                </FormControl>
                                                <FormLabel className="font-normal">At time of dose</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="15" />
                                                </FormControl>
                                                <FormLabel className="font-normal">15 minutes before</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="30" />
                                                </FormControl>
                                                <FormLabel className="font-normal">30 minutes before</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="60" />
                                                </FormControl>
                                                <FormLabel className="font-normal">1 hour before</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormDescription>When to send reminder notifications</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <div className="flex justify-end space-x-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Issuing..." : "Issue Prescription"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PrescriptionForm;
