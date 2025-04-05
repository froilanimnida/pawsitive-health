import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input } from "@/components/ui";
import type { TextFormField } from "@/types/forms/text-form-field";
import type { AppointmentControlSchema } from "../form-control-type";
import type { Control } from "react-hook-form";

type ExcludedFields = "appointment_date";

type TextFieldNames = keyof Omit<AppointmentControlSchema, ExcludedFields>;
interface TextFieldsProps {
    fields: TextFormField[];
    control: Control<AppointmentControlSchema>;
}

export function TextFields({ fields, control }: TextFieldsProps) {
    return (
        <>
            {fields.map((field) => (
                <FormField
                    key={field.name}
                    control={control}
                    name={field.name as TextFieldNames}
                    render={({ field: formField, fieldState }) => (
                        <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                                <Input
                                    {...formField}
                                    required={field.required}
                                    type="text"
                                    placeholder={field.placeholder}
                                />
                            </FormControl>
                            <FormDescription>{field.description}</FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            ))}
        </>
    );
}
