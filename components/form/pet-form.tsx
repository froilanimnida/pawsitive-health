"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { FormItem, Form, FormControl, FormField, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatBreeds, DogBreeds } from "@/types/breed-types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { PetSchema } from "@/schemas/pet-definition";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import toast from "react-hot-toast";
import { addPet } from "@/actions/pets";
import { toTitleCase } from "@/lib/functions/text/title-case";
import { procedure_type } from "@prisma/client";

const AddPetForm = () => {
    const [selectedBreed, setSelectedBreed] = useState<string | undefined>(undefined);
    const [selectedSpecies, setSelectedSpecies] = useState<string>("dog");
    const [procedures, setProcedures] = useState<any[]>([]);
    const [vaccinations, setVaccinations] = useState<any[]>([]);

    const getBreedOptions = () => {
        if (selectedSpecies === "dog") {
            return Object.values(DogBreeds);
        } else if (selectedSpecies === "cat") {
            return Object.values(CatBreeds);
        }
        return [];
    };
    const form = useForm({
        shouldFocusError: true,
        defaultValues: {
            name: "",
            species: "dog",
            breed: "",
            weight_kg: 0,
            sex: "prefer-not-to-say",
            date_of_birth: undefined,
        },
        progressive: true,
        resolver: zodResolver(PetSchema),
    });

    const textFields: {
        name: "name" | "species" | "breed" | "sex" | "weight_kg";
        label: string;
        placeholder: string;
        description: string;
        type: string;
    }[] = [
        {
            name: "name",
            label: "Name",
            placeholder: "Name",
            description: "Enter your pet name",
            type: "text",
        },
        {
            name: "weight_kg",
            label: "Weight (kg)",
            placeholder: "Weight",
            description: "Enter your pet's weight in kilograms",
            type: "number",
        },
    ];

    const selectFields: {
        name: "species" | "breed" | "sex";
        label: string;
        placeholder: string;
        description: string;
        options: { value: string; label: string }[];
        defaultValue?: string;
        onChange?: (value: string) => void;
    }[] = [
        {
            name: "species",
            label: "Species",
            placeholder: "Species",
            options: [
                { value: "dog", label: "Dog" },
                { value: "cat", label: "Cat" },
            ],
            description: "Select the species of your pet",
            defaultValue: selectedSpecies,
            onChange: (value) => {
                setSelectedSpecies(value);
                form.setValue("breed", "");
            },
        },
        {
            name: "breed",
            label: "Breed",
            placeholder: "Breed",
            description: "Select the breed of your pet",
            options: getBreedOptions().map((breed) => ({
                value: breed,
                label: toTitleCase(breed),
            })),
            defaultValue: selectedBreed,
            onChange: (value) => {
                setSelectedBreed(value);
            },
        },
        {
            name: "sex",
            label: "Sex",
            placeholder: "Sex",
            description: "Select the sex of your pet",
            options: [
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
            ],
            defaultValue: "prefer_not_to_say",
        },
    ];
    const addProcedure = () => {
        setProcedures([
            ...procedures,
            {
                procedure_type: "deworming",
                procedure_date: new Date(),
                product_used: "",
                dosage: "",
                notes: "",
            },
        ]);
    };

    const addVaccination = () => {
        setVaccinations([
            ...vaccinations,
            {
                vaccine_name: "",
                administered_date: new Date(),
                next_due_date: null,
                batch_number: "",
            },
        ]);
    };
    const onSubmit = async (values: z.infer<typeof PetSchema>) => {
        await toast.promise(addPet(values), {
            loading: "Adding pet...",
            success: "Pet added successfully",
            error: "Failed to add pet",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="basic">Basic Information</TabsTrigger>
                        <TabsTrigger value="healthcare">Healthcare History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic" className="space-y-4 w-full">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 justify-start items-start">
                            {textFields.map((textField) => (
                                <FormField
                                    key={textField.name}
                                    control={form.control}
                                    name={textField.name}
                                    render={({ field, formState }) => (
                                        <FormItem>
                                            <FormLabel>{textField.label}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type={textField.type || "text"}
                                                    placeholder={textField.placeholder}
                                                    {...(textField.type === "number"
                                                        ? {
                                                              onChange: (e) => field.onChange(+e.target.value),
                                                              value: field.value,
                                                          }
                                                        : {})}
                                                />
                                            </FormControl>
                                            <FormDescription>{textField.description}</FormDescription>
                                            <FormMessage>{formState.errors[textField.name]?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                        <FormField
                            name="date_of_birth"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? (
                                                        format(field.value, "MM/dd/yyyy")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        if (!date) {
                                                            field.onChange(null);
                                                            return;
                                                        }

                                                        const dateOnly = new Date(
                                                            date.getFullYear(),
                                                            date.getMonth(),
                                                            date.getDate()
                                                        );

                                                        field.onChange(dateOnly);
                                                    }}
                                                    initialFocus
                                                    disabled={(date) => date > new Date()}
                                                    className="bg-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormDescription>Enter your pet&apos;s date of birth</FormDescription>
                                    <FormMessage>{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 justify-start items-start">
                            {selectFields.map((selectField) => (
                                <FormField
                                    key={selectField.name}
                                    control={form.control}
                                    name={selectField.name}
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>{selectField.label}</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    if (selectField.onChange) selectField.onChange(value);
                                                }}
                                                value={field.value}
                                                defaultValue={field.value || selectField.defaultValue}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={selectField.placeholder} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {selectField.options.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>{selectField.description}</FormDescription>
                                            <FormMessage>{fieldState.error?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="healthcare" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {vaccinations.map((vaccination, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md relative"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        className="absolute right-2 top-2"
                                        onClick={() => {
                                            const newVaccinations = [...vaccinations];
                                            newVaccinations.splice(index, 1);
                                            setVaccinations(newVaccinations);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>

                                    <div className="gap-4 flex flex-col">
                                        <FormLabel>Vaccine Name</FormLabel>
                                        <Input
                                            value={vaccination.vaccine_name}
                                            onChange={(e) => {
                                                const newVaccinations = [...vaccinations];
                                                newVaccinations[index].vaccine_name = e.target.value;
                                                setVaccinations(newVaccinations);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <FormLabel>Administration Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {vaccination.administered_date ? (
                                                        format(vaccination.administered_date, "MM/dd/yyyy")
                                                    ) : (
                                                        <span>Select date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={vaccination.administered_date}
                                                    onSelect={(date) => {
                                                        const newVaccinations = [...vaccinations];
                                                        newVaccinations[index].administered_date = date;
                                                        setVaccinations(newVaccinations);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <FormLabel>Batch Number</FormLabel>
                                        <Input
                                            value={vaccination.batch_number}
                                            onChange={(e) => {
                                                const newVaccinations = [...vaccinations];
                                                newVaccinations[index].batch_number = e.target.value;
                                                setVaccinations(newVaccinations);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button type="button" variant="outline" onClick={addVaccination} className="w-full mt-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Vaccination
                        </Button>

                        {procedures.map((procedure, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-md relative"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    className="absolute right-2 top-2"
                                    onClick={() => {
                                        const newProcedures = [...procedures];
                                        newProcedures.splice(index, 1);
                                        setProcedures(newProcedures);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                <div className="gap-4 flex flex-col">
                                    <FormLabel>Procedure Type</FormLabel>
                                    <Select
                                        value={procedure.procedure_type}
                                        onValueChange={(value) => {
                                            const newProcedures = [...procedures];
                                            newProcedures[index].procedure_type = value;
                                            setProcedures(newProcedures);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select procedure type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(procedure_type).map((type) => {
                                                return (
                                                    <SelectItem key={type} value={type}>
                                                        {toTitleCase(type)}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <FormLabel>Date Performed</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {procedure.procedure_date ? (
                                                    format(procedure.procedure_date, "MM/dd/yyyy")
                                                ) : (
                                                    <span>Select date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                disabled={(date) => date > new Date()}
                                                mode="single"
                                                selected={procedure.procedure_date}
                                                onSelect={(date) => {
                                                    const newProcedures = [...procedures];
                                                    newProcedures[index].procedure_date = date;
                                                    setProcedures(newProcedures);
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div>
                                    <FormLabel>Product Used</FormLabel>
                                    <Input
                                        value={procedure.product_used}
                                        onChange={(e) => {
                                            const newProcedures = [...procedures];
                                            newProcedures[index].product_used = e.target.value;
                                            setProcedures(newProcedures);
                                        }}
                                    />
                                </div>

                                <div>
                                    <FormLabel>Dosage</FormLabel>
                                    <Input
                                        value={procedure.dosage}
                                        onChange={(e) => {
                                            const newProcedures = [...procedures];
                                            newProcedures[index].dosage = e.target.value;
                                            setProcedures(newProcedures);
                                        }}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <FormLabel>Notes</FormLabel>
                                    <Input
                                        value={procedure.notes}
                                        onChange={(e) => {
                                            const newProcedures = [...procedures];
                                            newProcedures[index].notes = e.target.value;
                                            setProcedures(newProcedures);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addProcedure} className="w-full mt-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Procedure
                        </Button>
                    </TabsContent>
                    <Button type="submit" className="mt-6">
                        Add Pet
                    </Button>
                </Tabs>
            </form>
        </Form>
    );
};

export default AddPetForm;
