import { appointment_status, appointment_type } from "@prisma/client";

// Define the Pet type that's referenced in Appointment
export interface Pet {
    pet_id: number;
    name: string;
    // Add other pet properties as needed
}

// Define the Veterinarian type that's referenced in Appointment
export interface Veterinarian {
    vet_id: number;
    users?: {
        first_name: string;
        last_name: string;
    };
    // Add other veterinarian properties as needed
}

// Define the Appointment type based on the Prisma schema
export interface Appointment {
    appointment_id: number;
    appointment_uuid: string;
    pet_id?: number | null;
    vet_id?: number | null;
    appointment_date: Date | string;
    notes?: string | null;
    appointment_type: appointment_type;
    status: appointment_status;
    duration_minutes: number;
    clinic_id?: number | null;
    pets?: Pet | null;
    veterinarians?: Veterinarian | null;
    // Add other appointment properties as needed
}
