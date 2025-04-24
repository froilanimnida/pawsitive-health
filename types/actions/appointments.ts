import { type appointment_type, type appointment_status, type Prisma } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

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
    appointment_id: number;
    appointment_type: appointment_type;
    created_at: Date;
    duration_minutes: number;
    notes: string | null;
    status: appointment_status;
    pets: {
        name: string;
        species: string;
        breed: string;
        weight_kg: Decimal;
        pet_id: number;
        pet_uuid: string;
    } | null;
    veterinarians: {
        specialization: string | null;
        vet_id: number;
        users: {
            first_name: string;
            last_name: string;
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

interface GetExistingAppointmentsType {
    appointments: {
        appointment_date: Date;
        duration_minutes: number;
        appointment_uuid: string;
        status: string;
    }[];
}

type GetVeterinarianAppointmentsType = Prisma.appointmentsGetPayload<{
    include: {
        pets: {
            include: {
                users: true;
            };
        };
        veterinarians: {
            include: {
                users: true;
            };
        };
    };
}>;

type VetAppointmentWithRelations = Prisma.appointmentsGetPayload<{
    include: {
        pets: {
            include: {
                users: true;
            };
        };
        veterinarians: {
            include: {
                users: true;
            };
        };
    };
}>;

export type {
    GetUserAppointmentsResponse,
    AppointmentDetailsResponse,
    GetExistingAppointmentsType,
    GetVeterinarianAppointmentsType,
    VetAppointmentWithRelations,
};
