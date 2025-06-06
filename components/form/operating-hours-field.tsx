"use client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Checkbox,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from "@/components/ui";
import { useFieldArray, useFormContext } from "react-hook-form";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const OperatingHoursField = () => {
    const form = useFormContext();
    useFieldArray({
        name: "operating_hours",
        control: form.control,
    });

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Clinic Operating Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAYS_OF_WEEK.map((day, i) => (
                    <Card key={day} className="mb-4 shadow-none border">
                        <CardHeader className="pb-2 ">
                            <CardTitle className="text-md">{day}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <FormItem>
                                    <FormLabel>Closed</FormLabel>
                                    <FormControl>
                                        <Checkbox
                                            checked={form.watch(`operating_hours.${i}.is_closed`)}
                                            onCheckedChange={(checked) => {
                                                form.setValue(`operating_hours.${i}.is_closed`, !!checked);
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>

                                <FormItem>
                                    <FormLabel>Opens At</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="time"
                                            disabled={form.watch(`operating_hours.${i}.is_closed`)}
                                            {...form.register(`operating_hours.${i}.opens_at`)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                <FormItem>
                                    <FormLabel>Closes At</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="time"
                                            disabled={form.watch(`operating_hours.${i}.is_closed`)}
                                            {...form.register(`operating_hours.${i}.closes_at`)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
