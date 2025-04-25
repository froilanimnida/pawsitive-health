import { Decimal } from "@prisma/client/runtime/library";
import {
    role_type,
    breed_type,
    pet_sex_type,
    species_type,
    appointment_status,
    appointment_type,
    veterinary_specialization,
    procedure_type,
} from "@prisma/client";

/**
 * Collection of test data constants for use in tests.
 * Organize by entity type for easy navigation.
 *
 * Usage examples:
 * - Basic usage: import { testUsers } from "../utils/testData";
 * - With spread for modification: {...testUsers.validUser, email: "different@example.com"}
 * - Type safety with test helpers: createTestUser({...testUsers.validUser, name: "Custom"})
 */

// ======== USER DATA ========
export const testUsers = {
    validUser: {
        user_id: 1,
        user_uuid: "test-user-uuid",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01"),
        deleted_at: null,
        disabled: false,
        email: "user@example.com",
        email_verified: true,
        email_verification_expires_at: null,
        email_verification_token: null,
        first_name: "John",
        last_name: "Doe",
        password_hash: "hashed_password",
        last_login: null,
        phone_number: "1234567890",
        otp_expires_at: null,
        otp_token: null,
        password_reset_expires_at: null,
        password_reset_token: null,
        role: role_type.user,
    },

    validVet: {
        user_id: 2,
        user_uuid: "test-vet-uuid",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01"),
        deleted_at: null,
        disabled: false,
        email: "vet@example.com",
        email_verified: true,
        email_verification_expires_at: null,
        email_verification_token: null,
        first_name: "Jane",
        last_name: "Smith",
        password_hash: "hashed_password",
        last_login: null,
        phone_number: "2345678901",
        otp_expires_at: null,
        otp_token: null,
        password_reset_expires_at: null,
        password_reset_token: null,
        role: role_type.veterinarian,
    },

    validClinic: {
        user_id: 3,
        user_uuid: "test-clinic-uuid",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01"),
        deleted_at: null,
        disabled: false,
        email: "clinic@example.com",
        email_verified: true,
        email_verification_expires_at: null,
        email_verification_token: null,
        first_name: "Clinic",
        last_name: "Admin",
        password_hash: "hashed_password",
        last_login: null,
        phone_number: "3456789012",
        otp_expires_at: null,
        otp_token: null,
        password_reset_expires_at: null,
        password_reset_token: null,
        role: role_type.client,
    },
};

// ======== USER FORM DATA ========
export const testFormData = {
    validSignUp: {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: "Password123!",
        confirm_password: "Password123!",
        phone_number: "1234567890",
    },

    validLogin: {
        email: "user@example.com",
        password: "Password123!",
    },

    validClinicSignUp: {
        first_name: "John",
        last_name: "Doe",
        email: "clinic@example.com",
        password: "Password123!",
        confirm_password: "Password123!",
        phone_number: "1234567890",
        name: "Pet Clinic",
        address: "123 Main St",
        city: "Anytown",
        state: "ST",
        postal_code: "12345",
        emergency_services: true,
        operating_hours: [
            { day_of_week: 0, opens_at: "08:00", closes_at: "17:00", is_closed: false },
            { day_of_week: 1, opens_at: "08:00", closes_at: "17:00", is_closed: false },
            { day_of_week: 2, opens_at: "08:00", closes_at: "17:00", is_closed: false },
            { day_of_week: 3, opens_at: "08:00", closes_at: "17:00", is_closed: false },
            { day_of_week: 4, opens_at: "08:00", closes_at: "17:00", is_closed: false },
            { day_of_week: 5, opens_at: "08:00", closes_at: "17:00", is_closed: false },
            { day_of_week: 6, opens_at: "08:00", closes_at: "17:00", is_closed: false },
        ],
    },

    validVetSignUp: {
        first_name: "Jane",
        last_name: "Smith",
        email: "vet@example.com",
        password: "Password123!",
        confirm_password: "Password123!",
        phone_number: "2345678901",
        license_number: "VET12345",
        specialization: veterinary_specialization.behaviorist,
    },
};

// ======== PET DATA ========
export const testPets = {
    validDog: {
        pet_id: 1,
        pet_uuid: "test-dog-uuid",
        name: "Buddy",
        user_id: 1,
        breed: breed_type.labrador_retriever,
        species: species_type.dog,
        sex: pet_sex_type.male,
        date_of_birth: new Date("2020-01-15"),
        weight_kg: Decimal(25.5),
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01"),
        deleted_at: null,
        private: false,
        deleted: false,
        profile_picture_url: null,
    },

    validCat: {
        pet_id: 2,
        pet_uuid: "test-cat-uuid",
        name: "Whiskers",
        user_id: 1,
        breed: breed_type.persian,
        species: species_type.cat,
        sex: pet_sex_type.female,
        date_of_birth: new Date("2021-03-10"),
        weight_kg: Decimal(4.2),
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01"),
        deleted_at: null,
        private: false,
        deleted: false,
        profile_picture_url: null,
    },
};

// ======== PET FORM DATA ========
export const testPetFormData = {
    validDog: {
        name: "Buddy",
        breed: breed_type.labrador_retriever,
        species: species_type.dog,
        sex: pet_sex_type.male,
        date_of_birth: new Date("2020-01-15"),
        weight_kg: 25.5,
    },

    validCat: {
        name: "Whiskers",
        breed: breed_type.persian,
        species: species_type.cat,
        sex: pet_sex_type.female,
        date_of_birth: new Date("2021-03-10"),
        weight_kg: 4.2,
    },
};

// ======== CLINIC DATA ========
export const testClinics = {
    validClinic: {
        clinic_id: 1,
        clinic_uuid: "test-clinic-uuid",
        user_id: 3,
        name: "Pet Clinic",
        address: "123 Main St",
        city: "Anytown",
        state: "ST",
        postal_code: "12345",
        phone_number: "3456789012",
        emergency_services: true,
        created_at: new Date("2023-01-01"),
        website: "https://petclinic.example.com",
        google_maps_url: "https://maps.google.com/?q=PetClinic",
        latitude: 37.7749,
        longitude: -122.4194,
    },
};

// ======== APPOINTMENT DATA ========
export const testAppointments = {
    validAppointment: {
        appointment_id: 1,
        appointment_uuid: "test-appointment-uuid",
        user_id: 1,
        pet_id: 1,
        clinic_id: 1,
        vet_id: 2,
        date: new Date("2025-05-15T10:30:00"),
        status: appointment_status.requested,
        type: appointment_type.wellness_exam,
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01"),
        cancelled: false,
        cancelled_reason: null,
        notes: "Regular checkup",
    },
};

// ======== MEDICATION DATA ========
export const testMedications = {
    validMedication: {
        medication_id: 1,
        medication_uuid: "test-medication-uuid",
        name: "Amoxicillin",
        description: "Antibiotic for bacterial infections",
        usage_instructions: "Take with food twice daily",
        side_effects: "May cause stomach upset",
        created_at: new Date("2023-01-01"),
    },
};

// ======== VACCINATION DATA ========
export const testVaccinations = {
    validVaccination: {
        vaccination_id: 1,
        vaccination_uuid: "test-vaccination-uuid",
        pet_id: 1,
        vaccine_name: "Rabies",
        administered_date: new Date("2023-06-15"),
        next_due_date: new Date("2024-06-15"),
        batch_number: "RAB123456",
        appointment_id: 1,
        administered_by: 2,
        created_at: new Date("2023-01-01"),
    },
};

// ======== HEALTHCARE PROCEDURE DATA ========
export const testProcedures = {
    validProcedure: {
        procedure_id: 1,
        procedure_uuid: "test-procedure-uuid",
        pet_id: 1,
        procedure_type: procedure_type.dental_cleaning,
        procedure_date: new Date("2023-05-10"),
        next_due_date: new Date("2024-05-10"),
        product_used: "Dental Pro Plus",
        dosage: "Standard application",
        notes: "Routine dental cleaning",
        appointment_id: 1,
        administered_by: 2,
        external_provider: null,
        created_at: new Date("2023-01-01"),
    },
};

// ======== PRESCRIPTION DATA ========
export const testPrescriptions = {
    validPrescription: {
        prescription_id: 1,
        prescription_uuid: "test-prescription-uuid",
        pet_id: 1,
        medication_id: 1,
        dosage: "10mg",
        frequency: "Twice daily",
        start_date: new Date("2023-06-01"),
        end_date: new Date("2023-06-14"),
        refills_remaining: 2,
        appointment_id: 1,
        vet_id: 2,
        created_at: new Date("2023-01-01"),
    },
};

// Helper function to create deep copies of test data
export const cloneTestData = <T>(data: T): T => JSON.parse(JSON.stringify(data));

// Helper function to create a modified copy of test data
export function createTestData<T>(baseData: T, modifications: Partial<T> = {}): T {
    return {
        ...baseData,
        ...modifications,
    };
}
