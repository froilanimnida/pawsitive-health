"use client";
import { useState, useEffect, type ReactNode } from "react";
import {
    Dialog,
    Calendar,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
    Label,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    Textarea,
} from "@/components/ui";
import { Loader2 } from "lucide-react";
import { format, addMinutes, addDays } from "date-fns";
import { getExistingAppointments, rescheduleAppointment } from "@/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
interface TimeSlot {
    time: string;
    available: boolean;
    statusMessage?: string | null;
}

interface RescheduleAppointmentDialogProps {
    appointmentUuid: string;
    vetId: number;
    currentDate: Date;
    currentNotes: string;
    children: ReactNode;
}

export function RescheduleAppointmentDialog({
    appointmentUuid,
    vetId,
    currentDate,
    currentNotes,
    children,
}: RescheduleAppointmentDialogProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(currentDate));
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | undefined>();
    const [notes, setNotes] = useState(currentNotes || "");
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Load available time slots when date changes
    useEffect(() => {
        if (!selectedDate || !isOpen) return;
        async function loadTimeSlots() {
            setIsLoadingTimeSlots(true);
            try {
                const response = await getExistingAppointments(selectedDate, vetId);

                if (!response.success) {
                    toast.error("Failed to load available time slots");
                    setTimeSlots([]);
                    return;
                }

                const appointments = response.data?.appointments || [];

                // Generate time slots from 8 AM to 5 PM
                const slots: TimeSlot[] = [];
                let currentSlot = new Date(selectedDate);
                currentSlot.setHours(8, 0, 0, 0);

                const endTime = new Date(selectedDate);
                endTime.setHours(17, 0, 0, 0);

                while (currentSlot < endTime) {
                    const slotStartTime = new Date(currentSlot);
                    const slotEndTime = addMinutes(currentSlot, 30);

                    // Check if this slot conflicts with any existing appointments
                    const matchingAppointments = appointments.filter((appointment) => {
                        const appointmentTime = new Date(appointment.appointment_date);
                        const appointmentEndTime = addMinutes(appointmentTime, appointment.duration_minutes || 30);

                        // Check for overlap
                        const hasOverlap =
                            (slotStartTime >= appointmentTime && slotStartTime < appointmentEndTime) ||
                            (slotEndTime > appointmentTime && slotEndTime <= appointmentEndTime) ||
                            (slotStartTime <= appointmentTime && slotEndTime >= appointmentEndTime);

                        return hasOverlap;
                    });

                    // Format status message if slot is unavailable
                    let statusMessage = null;
                    if (matchingAppointments.length > 0) {
                        statusMessage = "Unavailable";
                    }

                    slots.push({
                        time: format(currentSlot, "h:mm a"),
                        available: matchingAppointments.length === 0,
                        statusMessage,
                    });

                    currentSlot = addMinutes(currentSlot, 30);
                }

                setTimeSlots(slots);
                setSelectedTime(undefined);
            } catch (error) {
                console.error("Error loading time slots:", error);
                setTimeSlots([]);
            } finally {
                setIsLoadingTimeSlots(false);
            }
        }

        loadTimeSlots();
    }, [selectedDate, vetId, isOpen]);

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error("Please select both a date and time");
            return;
        }

        try {
            setIsSubmitting(true);

            // Parse the selected time and combine with selected date
            const [hourMinute, period] = selectedTime.split(" ");
            const [hourStr, minuteStr] = hourMinute.split(":");

            let hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);

            if (period === "PM" && hour < 12) hour += 12;
            else if (period === "AM" && hour === 12) hour = 0;

            const newDate = new Date(selectedDate);
            newDate.setHours(hour, minute, 0, 0);

            // Call the reschedule API
            const result = await rescheduleAppointment(appointmentUuid, newDate, notes);

            if (result === undefined) {
                toast.success("Appointment successfully rescheduled");
                setIsOpen(false);
                return;
            }

            toast.error(!result.success ? result.error : "Failed to reschedule appointment. Please try again later.");
            setIsOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reschedule appointment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                    <DialogDescription>
                        Select a new date and time for this appointment. Make sure it doesn&apos;t conflict with other
                        appointments.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (date) {
                                    setSelectedDate(date);
                                }
                                setSelectedTime(
                                    new Date().toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    }),
                                );
                            }}
                            initialFocus
                            disabled={(date) => date < addDays(new Date(), 0)}
                            className="rounded-md border"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="time">Time</Label>
                        {isLoadingTimeSlots ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : timeSlots.length > 0 ? (
                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Available Times</SelectLabel>
                                        {timeSlots.map((slot) => (
                                            <SelectItem
                                                key={slot.time}
                                                value={slot.time}
                                                disabled={!slot.available}
                                                className={cn(
                                                    !slot.available && "text-muted-foreground line-through opacity-50",
                                                )}
                                            >
                                                {slot.time} {!slot.available && `(${slot.statusMessage})`}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="text-center p-4 border rounded-md text-muted-foreground">
                                No available time slots. Please select another date.
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about this appointment..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!selectedDate || !selectedTime || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Rescheduling...
                            </>
                        ) : (
                            "Reschedule Appointment"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
