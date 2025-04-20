import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import * as petsActions from "@/actions/pets";
import { prismaMock } from "@/__tests__/utils/mocks";
import { breed_type } from "@prisma/client";

// Mock dependencies first
jest.mock("sonner", () => ({
    toast: {
        loading: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        dismiss: jest.fn(),
    },
}));

jest.mock("@/actions/pets", () => ({
    addPet: jest.fn(),
}));

// Mock the breed data to ensure test consistency
jest.mock("@/types/breed-types", () => ({
    DogBreeds: {
        LABRADOR_RETRIEVER: breed_type.labrador_retriever,
        GERMAN_SHEPHERD: breed_type.german_shepherd,
        GOLDEN_RETRIEVER: breed_type.golden_retriever,
    },
    CatBreeds: {
        PERSIAN: breed_type.persian,
        NORWEGIAN_FOREST_CAT: breed_type.norwegian_forest_cat,
        MAINE_COON: breed_type.maine_coon,
    },
}));

// Mock lib before importing AddPetForm
jest.mock("@/lib", () => {
    return {
        __esModule: true,
        toTitleCase: jest.fn((text) => {
            // Implement a simple toTitleCase for predictable test behavior
            if (!text) return "";
            const words = text.toLowerCase().split("_");
            return words.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        }),
        prisma: prismaMock,
        cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
    };
});

// Import after mocks to avoid circular references
import AddPetForm from "@/components/form/pet-form";

describe("AddPetForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the basic information tab with all fields correctly", async () => {
        await act(async () => {
            render(<AddPetForm />);
        });

        // Check if the basic tab is selected by default
        expect(screen.getByRole("tab", { name: /Basic Information/i })).toHaveAttribute("aria-selected", "true");

        // Check if all basic form fields are rendered
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Species/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Breed/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Sex/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Add Pet/i })).toBeInTheDocument();
    });

    it("switches to healthcare history tab and renders vaccination and procedure forms", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<AddPetForm />);
        });

        // Switch to healthcare tab
        await act(async () => {
            await user.click(screen.getByRole("tab", { name: /Healthcare History/i }));
        });

        // Check if healthcare tab content is displayed
        expect(screen.getByRole("button", { name: /Add Vaccination/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Add Procedure/i })).toBeInTheDocument();
    });

    it("adds vaccination records when clicking Add Vaccination button", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<AddPetForm />);
        });

        // Switch to healthcare tab
        await act(async () => {
            await user.click(screen.getByRole("tab", { name: /Healthcare History/i }));
        });

        // Add a vaccination record
        await act(async () => {
            await user.click(screen.getByRole("button", { name: /Add Vaccination/i }));
        });

        // Check if vaccination form fields appear
        expect(screen.getByLabelText(/Vaccine Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Vaccination Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Batch Number/i)).toBeInTheDocument();
    });

    it("adds procedure records when clicking Add Procedure button", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<AddPetForm />);
        });

        // Switch to healthcare tab
        await act(async () => {
            await user.click(screen.getByRole("tab", { name: /Healthcare History/i }));
        });

        // Add a procedure record
        await act(async () => {
            await user.click(screen.getByRole("button", { name: /Add Procedure/i }));
        });

        // Check if procedure form fields appear
        expect(screen.getByLabelText(/Procedure Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date Performed/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Product Used/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Dosage/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    });

    it("allows removal of added vaccinations", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<AddPetForm />);
        });

        // Switch to healthcare tab
        await act(async () => {
            await user.click(screen.getByRole("tab", { name: /Healthcare History/i }));
        });

        // Add a vaccination record
        await act(async () => {
            await user.click(screen.getByRole("button", { name: /Add Vaccination/i }));
        });

        // Verify vaccination fields are visible
        expect(screen.getByLabelText(/Vaccine Name/i)).toBeInTheDocument();

        // Remove the vaccination
        await act(async () => {
            await user.click(screen.getByRole("button", { name: "" })); // X button
        });

        // Verify vaccination fields are removed
        expect(screen.queryByLabelText(/Vaccine Name/i)).not.toBeInTheDocument();
    });

    it("updates species and resets breed when species is changed", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<AddPetForm />);
        });

        // Open species dropdown
        await act(async () => {
            await user.click(screen.getByRole("combobox", { name: /Species/i }));
        });

        // Select Cat
        await act(async () => {
            await user.click(screen.getByRole("option", { name: /Cat/i }));
        });

        // Open breed dropdown to check if options have changed to cat breeds
        await act(async () => {
            await user.click(screen.getByRole("combobox", { name: /Breed/i }));
        });

        // Verify cat breeds are available (e.g., Persian)
        expect(screen.getByRole("option", { name: /Persian/i })).toBeInTheDocument();
    });

    it("submits form with valid pet data", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<AddPetForm />);
        });

        // Mock successful pet addition
        (petsActions.addPet as jest.Mock).mockResolvedValueOnce(undefined);

        // Fill basic information
        await act(async () => {
            await user.type(screen.getByLabelText(/Name/i), "Fluffy");
        });

        await act(async () => {
            await user.type(screen.getByLabelText(/Weight/i), "12");
        });

        // Open species dropdown and select
        await act(async () => {
            await user.click(screen.getByRole("combobox", { name: /Species/i }));
        });

        await act(async () => {
            await user.click(screen.getByRole("option", { name: /Dog/i }));
        });

        // Open breed dropdown and select
        await act(async () => {
            await user.click(screen.getByRole("combobox", { name: /Breed/i }));
        });

        await act(async () => {
            await user.click(screen.getByRole("option", { name: /Labrador Retriever/i }));
        });

        // Open sex dropdown and select
        await act(async () => {
            await user.click(screen.getByRole("combobox", { name: /Sex/i }));
        });

        await act(async () => {
            await user.click(screen.getByRole("option", { name: /Male/i }));
        });

        // Select date of birth
        await act(async () => {
            await user.click(screen.getByRole("button", { name: /Pick a date/i }));
        });

        const todayButton = screen.getByRole("button", { name: new RegExp(String(new Date().getDate())) });

        await act(async () => {
            await user.click(todayButton);
        });

        // Submit form
        await act(async () => {
            await user.click(screen.getByRole("button", { name: /Add Pet/i }));
        });

        // Verify form submission
        await waitFor(() => {
            expect(petsActions.addPet).toHaveBeenCalled();
            expect(toast.loading).toHaveBeenCalledWith("Adding pet...");
            expect(toast.success).toHaveBeenCalledWith("Pet added successfully");
        });
    });

    it("shows error toast when pet addition fails", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(<AddPetForm />);
        });

        // Mock failed pet addition
        (petsActions.addPet as jest.Mock).mockResolvedValueOnce({ success: false, error: "Failed to add pet" });

        // Fill basic information
        await act(async () => {
            await user.type(screen.getByLabelText(/Name/i), "Rex");
        });

        await act(async () => {
            await user.type(screen.getByLabelText(/Weight/i), "15");
        });

        // Open species dropdown and select
        await act(async () => {
            await user.click(screen.getByRole("combobox", { name: /Species/i }));
        });

        await act(async () => {
            await user.click(screen.getByRole("option", { name: /Dog/i }));
        });

        // Open breed dropdown and select
        await act(async () => {
            await user.click(screen.getByRole("combobox", { name: /Breed/i }));
        });

        await act(async () => {
            await user.click(screen.getByRole("option", { name: /German Shepherd/i }));
        });

        // Open sex dropdown and select
        await act(async () => {
            await user.click(screen.getByRole("combobox", { name: /Sex/i }));
        });

        await act(async () => {
            await user.click(screen.getByRole("option", { name: /Male/i }));
        });

        // Submit form
        await act(async () => {
            await user.click(screen.getByRole("button", { name: /Add Pet/i }));
        });

        // Verify error handling
        await waitFor(() => {
            expect(toast.loading).toHaveBeenCalledWith("Adding pet...");
            expect(toast.error).toHaveBeenCalledWith("Failed to add pet");
        });
    });
});
