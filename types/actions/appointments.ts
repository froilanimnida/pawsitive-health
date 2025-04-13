import { type appointment_type, type appointment_status } from "@prisma/client";

type GetUserAppointmentsResponse = {
    appointment_id: number;
    appointment_uuid: string;
    appointment_date: Date;
    appointment_type: appointment_type;
    notes: string | null;
    status: appointment_status;
    pets: {
        name: string;
    } | null;
    veterinarians: {
        users: {
            first_name: string;
            last_name: string;
        } | null;
    } | null;
    clinics: {
        name: string;
    } | null;
};

type AppointmentDetailsResponse = {
    appointment_uuid: string;
    appointment_date: Date;
    appointment_type: appointment_type;
    created_at: Date;
    duration_minutes: number;
    notes: string | null;
    status: appointment_status;
    pets: {
        name: string;
        species: string;
        breed: string;
        weight_kg: number;
        pet_id: number;
    } | null;
    veterinarians: {
        specialization: string | null;
        users: {
            first_name: string;
            last_name: string;
            vet_id: number;
        } | null;
    } | null;
    clinics: {
        name: string;
        address: string;
        city: string;
        state: string;
        postal_code: string;
        phone_number: string;
    } | null;
};

export type { GetUserAppointmentsResponse, AppointmentDetailsResponse };
