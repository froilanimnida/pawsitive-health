"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trash, Plus } from "lucide-react";
import { TimeSlotType } from "@/schemas/prescription-definition";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TimeSlotEditorProps {
    value: TimeSlotType[];
    onChange: (value: TimeSlotType[]) => void;
    disabled?: boolean;
    maxSlots?: number;
}

/**
 * Format a time slot for display
 */
function formatTimeSlot(hour: number, minute: number): string {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;
    return `${displayHour}:${displayMinute} ${period}`;
}

const TimeSlotEditor = ({ value, onChange, disabled = false, maxSlots = 5 }: TimeSlotEditorProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newHour, setNewHour] = useState("9");
    const [newMinute, setNewMinute] = useState("0");

    // Generate hours array (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => ({
        value: String(i),
        label: i === 0 ? "12 AM" : i === 12 ? "12 PM" : i < 12 ? `${i} AM` : `${i - 12} PM`,
    }));

    // Generate minutes array (0, 15, 30, 45)
    const minutes = [
        { value: "0", label: "00" },
        { value: "15", label: "15" },
        { value: "30", label: "30" },
        { value: "45", label: "45" },
    ];

    const addTimeSlot = () => {
        const hour = parseInt(newHour, 10);
        const minute = parseInt(newMinute, 10);

        // Check if this time already exists
        const exists = value.some((slot) => slot.hour === hour && slot.minute === minute);

        if (!exists) {
            const newSlot: TimeSlotType = {
                hour,
                minute,
                enabled: true,
            };
            onChange([...value, newSlot]);
            setIsDialogOpen(false);
        }
    };

    const removeTimeSlot = (index: number) => {
        const newSlots = [...value];
        newSlots.splice(index, 1);
        onChange(newSlots);
    };

    const canAddMoreSlots = !maxSlots || value.length < maxSlots;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {value.map((slot, index) => (
                    <Badge key={index} variant="outline" className="py-2 px-3 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatTimeSlot(slot.hour, slot.minute)}

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 rounded-full"
                            onClick={() => removeTimeSlot(index)}
                            disabled={disabled}
                        >
                            <Trash className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                        </Button>
                    </Badge>
                ))}

                {canAddMoreSlots && !disabled && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm" className="flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Add Time
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Administration Time</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="hour">Hour</Label>
                                        <Select value={newHour} onValueChange={setNewHour}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Hour" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hours.map((hour) => (
                                                    <SelectItem key={hour.value} value={hour.value}>
                                                        {hour.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="minute">Minute</Label>
                                        <Select value={newMinute} onValueChange={setNewMinute}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Minute" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {minutes.map((minute) => (
                                                    <SelectItem key={minute.value} value={minute.value}>
                                                        {minute.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" onClick={addTimeSlot}>
                                    Add Time
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export default TimeSlotEditor;
