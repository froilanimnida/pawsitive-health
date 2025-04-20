import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import PrescriptionForm from "@/components/form/prescription-form";
import { toast } from "sonner";
import * as actions from "@/actions";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Add missing DOM APIs needed by Radix UI
beforeAll(() => {
    // Mock hasPointerCapture
    if (!HTMLElement.prototype.hasPointerCapture) {
        HTMLElement.prototype.hasPointerCapture = jest.fn(() => false);
    }

    // Mock setPointerCapture
    if (!HTMLElement.prototype.setPointerCapture) {
        HTMLElement.prototype.setPointerCapture = jest.fn();
    }

    // Mock releasePointerCapture
    if (!HTMLElement.prototype.releasePointerCapture) {
        HTMLElement.prototype.releasePointerCapture = jest.fn();
    }

    // Mock the function that Radix UI is trying to access
    if (!Element.prototype.scrollIntoView) {
        Element.prototype.scrollIntoView = jest.fn();
    }
});

// Mock the cn utility from @/lib
jest.mock("@/lib", () => {
    const originalModule = jest.requireActual("@/lib");
    return {
        __esModule: true,
        ...originalModule,
        cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
    };
});

// Mock dependencies
jest.mock("sonner", () => ({
    toast: {
        loading: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        dismiss: jest.fn(),
    },
}));

jest.mock("@/actions", () => ({
    addPrescription: jest.fn(),
}));

const medicationList = [
    {
        medication_id: 1,
        name: "Frontline",
        description: "Flea and tick treatment",
        usage_instructions: "Apply monthly to back of neck",
        side_effects: "None known",
        created_at: new Date(),
        medication_uuid: "med-uuid-1",
    },
    {
        medication_id: 2,
        name: "Advantage",
        description: "Flea treatment",
        usage_instructions: "Apply monthly to back of neck",
        side_effects: "May cause skin irritation",
        created_at: new Date(),
        medication_uuid: "med-uuid-2",
    },
    {
        medication_id: 3,
        name: "Revolution",
        description: "Parasite prevention",
        usage_instructions: "Apply monthly to back of neck",
        side_effects: "Temporary hair loss at application site",
        created_at: new Date(),
        medication_uuid: "med-uuid-3",
    },
];

describe("PrescriptionForm", () => {
    const mockPetId = 123;
    const mockAppointmentUuid = "appointment-uuid-123";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders all form fields correctly", async () => {
        render(
            <PrescriptionForm
                petId={mockPetId}
                appointmentUuid={mockAppointmentUuid}
                medicationList={medicationList}
            />,
        );

        // Check if all form fields are rendered
        expect(screen.getByLabelText(/Medication/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Dosage/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Frequency/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Refills/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Issue Prescription/i })).toBeInTheDocument();
    });

    it("displays medications in the dropdown", async () => {
        render(
            <PrescriptionForm
                petId={mockPetId}
                appointmentUuid={mockAppointmentUuid}
                medicationList={medicationList}
            />,
        );

        // Open the medication dropdown
        const user = userEvent.setup();
        await user.click(screen.getByRole("combobox", { name: /Medication/i }));

        // Check if all medications are listed
        medicationList.forEach((med) => {
            expect(screen.getByRole("option", { name: med.name })).toBeInTheDocument();
        });
    });

    it("submits form with valid prescription data", async () => {
        // Mock successful prescription submission
        (actions.addPrescription as jest.Mock).mockResolvedValue(undefined);

        render(
            <PrescriptionForm
                petId={mockPetId}
                appointmentUuid={mockAppointmentUuid}
                medicationList={medicationList}
            />,
        );
        const user = userEvent.setup();

        // Fill the form
        // Select medication
        await user.click(screen.getByRole("combobox", { name: /Medication/i }));
        await user.click(screen.getByRole("option", { name: "Frontline" }));

        // Enter dosage
        await user.type(screen.getByLabelText(/Dosage/i), "10mg twice daily");

        // Enter frequency
        await user.type(screen.getByLabelText(/Frequency/i), "Every 12 hours");

        // Start date is pre-filled with today
        // End date is pre-filled with today + 7 days

        // Set refills
        const refillsInput = screen.getByLabelText(/Refills/i);
        await user.clear(refillsInput);
        await user.type(refillsInput, "3");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Issue Prescription/i }));

        // Verify form submission
        await waitFor(() => {
            expect(actions.addPrescription).toHaveBeenCalledWith(
                expect.objectContaining({
                    pet_id: mockPetId,
                    appointment_uuid: mockAppointmentUuid,
                    medication_id: 1,
                    dosage: "10mg twice daily",
                    frequency: "Every 12 hours",
                    start_date: expect.any(Date),
                    end_date: expect.any(Date),
                    refills_remaining: 3,
                }),
            );

            expect(toast.loading).toHaveBeenCalledWith("Issuing prescription...");
            expect(toast.success).toHaveBeenCalledWith("Prescription issued successfully");
        });
    });

    it("shows error toast when prescription submission fails", async () => {
        // Mock failed prescription submission
        (actions.addPrescription as jest.Mock).mockResolvedValue({
            success: false,
            error: "Failed to issue prescription",
        });

        render(
            <PrescriptionForm
                petId={mockPetId}
                appointmentUuid={mockAppointmentUuid}
                medicationList={medicationList}
            />,
        );
        const user = userEvent.setup();

        // Fill the form with minimal required data
        await user.click(screen.getByRole("combobox", { name: /Medication/i }));
        await user.click(screen.getByRole("option", { name: "Advantage" }));

        await user.type(screen.getByLabelText(/Dosage/i), "5ml");
        await user.type(screen.getByLabelText(/Frequency/i), "Once daily");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Issue Prescription/i }));

        // Verify error handling
        await waitFor(() => {
            expect(actions.addPrescription).toHaveBeenCalled();
            expect(toast.loading).toHaveBeenCalledWith("Issuing prescription...");
            expect(toast.error).toHaveBeenCalledWith("Failed to issue prescription");
        });
    });

    it("disables the form during submission", async () => {
        // Mock slow prescription submission
        (actions.addPrescription as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100)),
        );

        render(
            <PrescriptionForm
                petId={mockPetId}
                appointmentUuid={mockAppointmentUuid}
                medicationList={medicationList}
            />,
        );
        const user = userEvent.setup();

        // Fill the form with minimal required data
        await user.click(screen.getByRole("combobox", { name: /Medication/i }));
        await user.click(screen.getByRole("option", { name: "Frontline" }));

        await user.type(screen.getByLabelText(/Dosage/i), "1 pipette");
        await user.type(screen.getByLabelText(/Frequency/i), "Monthly");

        // Submit the form
        const submitButton = screen.getByRole("button", { name: /Issue Prescription/i });
        await user.click(submitButton);

        // Verify button is disabled during submission
        await waitFor(() => {
            const button = screen.getByRole("button", { name: /Issuing\.\.\./i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute("disabled");
        });

        // Wait for submission to complete
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Prescription issued successfully");
        });
    });
});
