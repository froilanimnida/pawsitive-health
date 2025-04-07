import type {
    pets,
    vaccinations,
    medical_records,
    healthcare_procedures,
    health_monitoring,
    appointments,
    prescriptions,
    medications,
    veterinarians,
    clinics,
} from "@prisma/client";

export type Pets = Omit<pets, "weight_kg"> & {
    weight_kg: string;
};

export type HealthMonitoring = Omit<health_monitoring, "weight_kg" | "temperature_celsius"> & {
    weight_kg: string;
    temperature_celsius: string;
};

export type VeterinarianWithUser = veterinarians & {
    users: {
        first_name: string;
        last_name: string;
    } | null;
};

export type VaccinationWithVet = vaccinations & {
    veterinarians: VeterinarianWithUser | null;
};

export type MedicalRecordWithVet = medical_records & {
    veterinarians: VeterinarianWithUser | null;
};

export type HealthcareProcedureWithVet = healthcare_procedures & {
    veterinarians: VeterinarianWithUser | null;
};

export type PrescriptionWithDetails = prescriptions & {
    medications: medications | null;
    veterinarians: VeterinarianWithUser | null;
};

export type AppointmentWithDetails = appointments & {
    veterinarians: VeterinarianWithUser | null;
    clinics: clinics | null;
};

export type PetWithHealthRecords = Pets & {
    vaccinations: VaccinationWithVet[];
    medical_records: MedicalRecordWithVet[];
    healthcare_procedures: HealthcareProcedureWithVet[];
    appointments: AppointmentWithDetails[];
    prescriptions: PrescriptionWithDetails[];
    health_monitoring: HealthMonitoring[];
};

export type PetMedicalHistory = {
    pet: PetWithHealthRecords;
};

export type GetPetResponse = {
    success: boolean;
    data?: PetMedicalHistory;
    error?: string;
};
