import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Clock, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeSlot } from "../use-appointment-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimeSelectorProps {
    control: any;
    selectedDate?: Date;
    selectedVetId: string;
    timeSlots: TimeSlot[];
    isLoadingTimeSlots: boolean;
}

export function TimeSelector({
    control,
    selectedDate,
    selectedVetId,
    timeSlots,
    isLoadingTimeSlots,
}: TimeSelectorProps) {
    return (
        <FormField
            name="appointment_time"
            control={control}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Appointment Time</FormLabel>
                    <FormControl>
                        <div className="flex flex-col space-y-2">
                            {!selectedDate || !selectedVetId ? (
                                <p className="text-sm text-muted-foreground">
                                    Please select a date and veterinarian first
                                </p>
                            ) : isLoadingTimeSlots ? (
                                <p className="text-sm text-muted-foreground">Loading available times...</p>
                            ) : timeSlots.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No availability for this date</p>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {timeSlots.map((slot) => (
                                        <TooltipProvider key={slot.time}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={field.value === slot.time ? "default" : "outline"}
                                                            onClick={() => slot.available && field.onChange(slot.time)}
                                                            disabled={!slot.available}
                                                            className={cn(
                                                                "justify-center w-full",
                                                                !slot.available &&
                                                                    "border-red-200 bg-red-50 text-red-600",
                                                            )}
                                                        >
                                                            {slot.available ? (
                                                                <Clock className="mr-2 h-3 w-3" />
                                                            ) : (
                                                                <X className="mr-2 h-3 w-3" />
                                                            )}
                                                            {slot.time}
                                                        </Button>
                                                    </div>
                                                </TooltipTrigger>
                                                {!slot.available && slot.statusMessage && (
                                                    <TooltipContent>
                                                        <p>{slot.statusMessage}</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormDescription>Pick an available time slot</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
