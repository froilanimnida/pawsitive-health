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
    FormDescription,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Calendar,
    Textarea,
    TabsList,
    TabsTrigger,
    TabsContent,
    Tabs,
} from "@/components/ui";
import { FileUpload } from "@/components/ui/file-upload";
import { CatBreeds, DogBreeds } from "@/types";
import { cn, createFormConfig, toTitleCase } from "@/lib";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { addPet } from "@/actions/pets";
import { breed_type, pet_sex_type, procedure_type, species_type } from "@prisma/client";
import { SelectFormField } from "@/types/forms/select-form-field";
import { uploadPetImage } from "@/lib/functions/upload/upload-pet-image";
import { updatePetProfileImage } from "@/lib/functions/upload/update-pet-profile-image";
import { OnboardingPetSchema, type PetOnboardingSchema, type PetType } from "@/schemas";

// Define procedure interface for better type safety
interface ProcedureEntry {
    procedure_type: procedure_type;
    procedure_date: Date;
    product_used: string;
    dosage: string;
    notes: string;
}

// Define vaccination interface for better type safety
interface VaccinationEntry {
    vaccine_name: string;
    administered_date: Date;
    next_due_date: Date | null;
    batch_number: string;
}

const AddPetForm = () => {
    // State management
    const [selectedBreed, setSelectedBreed] = useState<breed_type | string>("");
    const [selectedSpecies, setSelectedSpecies] = useState<species_type>("dog");
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [procedures, setProcedures] = useState<ProcedureEntry[]>([]);
    const [vaccinations, setVaccinations] = useState<VaccinationEntry[]>([]);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    // Get breed options based on selected species
    const getBreedOptions = () => {
        if (selectedSpecies === "dog") {
            return Object.values(DogBreeds);
        } else if (selectedSpecies === "cat") {
            return Object.values(CatBreeds);
        }
        return [];
    };

    // Initialize form with validation
    const form = useForm<PetType>(
        createFormConfig({
            defaultValues: {
                name: "",
                species: "dog",
                breed: "",
                weight_kg: 0,
                sex: pet_sex_type.prefer_not_to_say,
                date_of_birth: undefined,
                profile_picture_url: "",
            },
            resolver: zodResolver(OnboardingPetSchema),
        }),
    );

    // Handle profile image changes
    const handleImageChange = (file: File | null) => {
        setProfileImage(file);

        // If we're removing the image
        if (!file) {
            setProfileImageUrl(null);
            form.setValue("profile_picture_url", "");
            return;
        }
    };

    // Form field definitions for basic text inputs
    const textFields = [
        {
            name: "name" as const,
            label: "Name",
            placeholder: "Name",
            description: "Enter your pet name",
            type: "text",
        },
        {
            name: "weight_kg" as const,
            label: "Weight (kg)",
            placeholder: "Weight",
            description: "Enter your pet's weight in kilograms",
            type: "number",
        },
    ];

    // Form field definitions for select inputs
    const selectFields: SelectFormField[] = [
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
            required: true,
            onChange: (value) => {
                setSelectedSpecies(value as species_type);
                form.setValue("breed", "");
            },
        },
        {
            name: "breed",
            label: "Breed",
            required: true,
            placeholder: "Breed",
            description: "Select the breed of your pet",
            options: getBreedOptions().map((breed) => ({
                value: breed,
                label: toTitleCase(breed),
            })),
            defaultValue: selectedBreed,
            onChange: (value) => {
                setSelectedBreed(value as breed_type);
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
            defaultValue: "male" as pet_sex_type,
            required: true,
        },
    ];

    // Add new procedure to the list
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

    // Add new vaccination to the list
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

    // Form submission handler
    const onSubmit = async (values: PetOnboardingSchema) => {
        try {
            toast.loading("Adding pet...");
            setIsUploading(true);

            // Upload image if present - we'll still use uploadPetImage directly here
            // since we don't have a pet_id yet (we need to create the pet first)
            if (profileImage) {
                try {
                    const uploadResult = await uploadPetImage(profileImage);
                    values.profile_picture_url = uploadResult.url;
                    // Save the key for future use
                    values.profile_picture_key = uploadResult.key;
                } catch (error) {
                    console.error("Failed to upload profile image:", error);
                    toast.error("Failed to upload profile image. Pet will be added without a profile picture.");
                }
            }

            const result = await addPet(values);
            setIsUploading(false);

            if (result === undefined) {
                toast.dismiss();
                toast.success("Pet added successfully");
                return;
            }
            toast.error("Failed to add pet");
        } catch (error) {
            setIsUploading(false);
            toast.error("An error occurred while adding the pet");
            console.error("Error adding pet:", error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="flex flex-wrap justify-start items-start w-full mb-4">
                        <TabsTrigger value="basic">Basic Information</TabsTrigger>
                        <TabsTrigger value="healthcare">Healthcare History</TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-4 w-full">
                        {/* Profile Picture Upload */}
                        <div className="mb-4">
                            <FormLabel>Pet Profile Picture</FormLabel>
                            <div className="mt-1">
                                <FileUpload
                                    onFileChange={handleImageChange}
                                    currentImageUrl={profileImageUrl}
                                    label="Upload a profile picture for your pet"
                                />
                            </div>
                            <FormDescription>Upload a profile picture for your pet (optional)</FormDescription>
                        </div>

                        {/* Text Fields */}
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

                        {/* Date of Birth Field */}
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
                                                        !field.value && "text-muted-foreground",
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
                                                            date.getDate(),
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

                        {/* Select Fields */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 justify-start items-start">
                            {selectFields.map((selectField) => (
                                <FormField
                                    key={selectField.name}
                                    control={form.control}
                                    name={selectField.name as "species" | "breed" | "sex"}
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
                                                    <SelectTrigger className="w-full">
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

                    {/* Healthcare History Tab */}
                    <TabsContent value="healthcare" className="space-y-6">
                        {/* Vaccinations */}
                        <div className="grid grid-cols-1 gap-4 mb-6">
                            {vaccinations.map((vaccination, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 gap-4 mb-4 p-4 border rounded-md relative place-content-center"
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

                                    <div className="gap-4 flex flex-col w-auto">
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

                                    <div className="gap-4 flex flex-col">
                                        <FormLabel>Vaccination Date</FormLabel>
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
                                                        if (!date) return;
                                                        const newVaccinations = [...vaccinations];
                                                        newVaccinations[index].administered_date = date;
                                                        setVaccinations(newVaccinations);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="gap-4 flex flex-col">
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

                        {/* Medical Procedures */}
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

                                <div className="flex flex-col gap-3">
                                    <FormLabel>Procedure Type</FormLabel>
                                    <Select
                                        value={procedure.procedure_type}
                                        onValueChange={(value) => {
                                            const newProcedures = [...procedures];
                                            newProcedures[index].procedure_type = value as procedure_type;
                                            setProcedures(newProcedures);
                                        }}
                                    >
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
                                </div>

                                <div className="flex flex-col gap-3">
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
                                                    if (!date) return;
                                                    const newProcedures = [...procedures];
                                                    newProcedures[index].procedure_date = date;
                                                    setProcedures(newProcedures);
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="flex flex-col gap-3">
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

                                <div className="flex flex-col gap-3">
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

                                <div className="md:col-span-2 flex flex-col gap-3">
                                    <FormLabel>Notes</FormLabel>
                                    <Textarea
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

                    {/* Submit Button - Outside TabsContent to be visible on all tabs */}
                    <Button type="submit" className="mt-6" disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Add Pet"}
                    </Button>
                </Tabs>
            </form>
        </Form>
    );
};

export default AddPetForm;
