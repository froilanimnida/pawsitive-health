"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    FormItem,
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
    Input,
    Button,
    FormDescription,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    Calendar,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui";
import { addHealthcareProcedure } from "@/actions";
import { type ProcedureType, ProcedureSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { toTitleCase } from "@/lib";
import { procedure_type } from "@prisma/client";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib";
import { useRouter } from "next/navigation";

interface PetProcedureFormProps {
    petUuid?: string;
    petId?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const PetProcedureForm = ({ petUuid, onSuccess, onCancel, petId }: PetProcedureFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const petProcedureForm = useForm({
        resolver: zodResolver(ProcedureSchema),
        reValidateMode: "onChange",
        shouldFocusError: true,
        progressive: true,
        defaultValues: {
            pet_uuid: petUuid,
            pet_id: petId,
            procedure_type: "deworming" as procedure_type,
            procedure_date: new Date(),
            next_due_date: undefined,
            product_used: "",
            dosage: "",
            notes: "",
        },
    });

    const onSubmit = async (values: ProcedureType) => {
        setIsLoading(true);

        try {
            const result = await addHealthcareProcedure(values);

            if (result.success) {
                toast.success("Healthcare procedure added successfully");
                petProcedureForm.reset();

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.refresh();
                }
            } else {
                toast.error(result.error || "Failed to add healthcare procedure");
            }
        } catch (error) {
            console.error("Error adding healthcare procedure:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...petProcedureForm}>
            <form onSubmit={petProcedureForm.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-6">
                    <FormField
                        control={petProcedureForm.control}
                        name="procedure_type"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Procedure Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select procedure type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(procedure_type).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {toTitleCase(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>The type of healthcare procedure performed</FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={petProcedureForm.control}
                        name="procedure_date"
                        render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Procedure Date</FormLabel>
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
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date > new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>The date when the procedure was performed</FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={petProcedureForm.control}
                        name="next_due_date"
                        render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Next Due Date (Optional)</FormLabel>
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
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Select next due date</span>
                                                )}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>When this procedure needs to be performed again</FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={petProcedureForm.control}
                        name="product_used"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Product Used</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter product name" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>The name of the medication or product used</FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={petProcedureForm.control}
                        name="dosage"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 10mg/kg" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>The dosage of the medication or product</FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={petProcedureForm.control}
                    name="notes"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional notes about the procedure"
                                    className="min-h-[120px]"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>
                                Any additional information about the procedure or observations
                            </FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Add Procedure"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PetProcedureForm;
