import {
    getUserAppointments,
    createUserAppointment,
    getClinicAppointments,
    getVeterinarianAppointments,
    cancelAppointment,
    confirmAppointment,
    rescheduleAppointment,
    getExistingAppointments,
} from "../../actions/appointment";
import { prismaMock, mockSession, mockVetSession } from "../utils/mocks";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { appointment_status, appointment_type, veterinary_specialization } from "@prisma/client";

// Mock dependencies
jest.mock("next-auth");
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));
jest.mock("../../actions/calendar-sync", () => ({
    addToGoogleCalendar: jest.fn(),
    updateGoogleCalendarEvent: jest.fn(),
    deleteGoogleCalendarEvent: jest.fn(),
}));
jest.mock("../../actions/notification", () => ({
    createNotification: jest.fn(),
}));
jest.mock("../../actions", () => ({
    getPet: jest.fn().mockResolvedValue({
        success: true,
        data: {
            pet: {
                pet_id: 1,
                pet_uuid: "test-pet-uuid",
                name: "Fluffy",
                breed: "LABRADOR_RETRIEVER",
                species: "DOG",
                weight_kg: "25.50",
            },
        },
    }),
    getClinic: jest.fn().mockResolvedValue({
        success: true,
        data: {
            clinic: {
                clinic_id: 1,
                name: "Test Clinic",
                address: "123 Main St",
                city: "Test City",
                state: "TS",
                postal_code: "12345",
                phone_number: "123-456-7890",
            },
        },
    }),
    sendEmail: jest.fn().mockResolvedValue(true),
}));

describe("Appointment Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    describe("getUserAppointments", () => {
        it("should get all appointments for the current user", async () => {
            const mockAppointments = [
                {
                    appointment_id: 1,
                    appointment_uuid: "test-uuid-1",
                    appointment_date: new Date("2025-05-01T10:00:00"),
                    appointment_type: "CHECKUP",
                    notes: "Regular checkup",
                    status: "confirmed",
                    pets: { name: "Fluffy" },
                    veterinarians: {
                        users: {
                            first_name: "Dr",
                            last_name: "Smith",
                        },
                    },
                    clinics: { name: "Test Clinic" },
                },
                {
                    appointment_id: 2,
                    appointment_uuid: "test-uuid-2",
                    appointment_date: new Date("2025-05-15T14:30:00"),
                    appointment_type: "VACCINATION",
                    notes: "Annual vaccines",
                    status: "requested",
                    pets: { name: "Max" },
                    veterinarians: {
                        users: {
                            first_name: "Dr",
                            last_name: "Johnson",
                        },
                    },
                    clinics: { name: "Pet Care Clinic" },
                },
            ];

            prismaMock.appointments.findMany.mockResolvedValueOnce(mockAppointments);

            const result = await getUserAppointments();

            expect(result).toEqual({
                success: true,
                data: { appointments: mockAppointments },
            });

            expect(prismaMock.appointments.findMany).toHaveBeenCalledWith({
                where: {
                    pets: {
                        user_id: Number(mockSession.user.id),
                        deleted: false,
                    },
                },
                select: expect.any(Object),
            });
        });

        it("should redirect when user is not authenticated", async () => {
            (getServerSession as jest.Mock).mockResolvedValueOnce(null);

            await getUserAppointments();

            expect(redirect).toHaveBeenCalledWith("/signin");
            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            prismaMock.appointments.findMany.mockRejectedValueOnce(new Error("Database error"));

            const result = await getUserAppointments();

            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("createUserAppointment", () => {
        const mockAppointmentData = {
            pet_uuid: "test-pet-uuid",
            vet_id: 1,
            clinic_id: 1,
            appointment_date: new Date("2025-05-01T10:00:00"),
            appointment_time: "10:00 AM",
            appointment_type: "CHECKUP",
            notes: "Regular checkup",
            duration_minutes: 30,
        };

        it("should create a new appointment successfully", async () => {
            // Mock no conflicting appointments
            prismaMock.appointments.findMany.mockResolvedValueOnce([]);
            prismaMock.appointments.findMany.mockResolvedValueOnce([]);

            // Mock successful creation
            prismaMock.appointments.create.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: "new-appointment-uuid",
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                appointment_date: mockAppointmentData.appointment_date,
                appointment_type: appointment_type.allergy_testing,
                notes: "Regular checkup",
                status: "requested",
                duration_minutes: 30,
                created_at: new Date(),
                metadata: {},
            });

            prismaMock.veterinarians.findUnique.mockResolvedValueOnce({
                vet_id: 1,
                user_id: 2,
                license_number: "VET123",
                specialization: veterinary_specialization.behaviorist,
                created_at: new Date(),
                users: {
                    user_id: 2,
                    first_name: "Dr",
                    last_name: "Smith",
                    email: "dr.smith@example.com",
                    password: "hashed_password",
                    role: "VETERINARIAN",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: true,
                data: { appointment_uuid: "new-appointment-uuid" },
            });

            expect(prismaMock.appointments.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    pet_id: 1,
                    vet_id: 1,
                    clinic_id: 1,
                    appointment_date: mockAppointmentData.appointment_date,
                    appointment_type: mockAppointmentData.appointment_type,
                    notes: mockAppointmentData.notes,
                    status: "requested",
                    duration_minutes: 30,
                }),
            });
        });

        it("should detect veterinarian scheduling conflicts", async () => {
            // Mock conflicting vet appointments
            prismaMock.appointments.findMany.mockResolvedValueOnce([
                {
                    appointment_id: 3,
                    appointment_uuid: "existing-appointment",
                    pet_id: 2,
                    vet_id: "1",
                    clinic_id: 1,
                    appointment_date: mockAppointmentData.appointment_date,
                    appointment_type: appointment_type.allergy_testing,
                    notes: "Another appointment",
                    status: "confirmed",
                    duration_minutes: 30,
                    created_at: new Date(),
                    metadata: {},
                },
            ]);

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: false,
                error: "The veterinarian already has an appointment at this time",
            });

            expect(prismaMock.appointments.create).not.toHaveBeenCalled();
        });

        it("should detect user scheduling conflicts", async () => {
            // Mock no conflicting vet appointments
            prismaMock.appointments.findMany.mockResolvedValueOnce([]);

            // Mock conflicting user appointments
            prismaMock.appointments.findMany.mockResolvedValueOnce([
                {
                    appointment_id: 4,
                    appointment_uuid: "existing-user-appointment",
                    pet_id: 3,
                    vet_id: 2,
                    clinic_id: 1,
                    appointment_date: mockAppointmentData.appointment_date,
                    appointment_type: appointment_type.allergy_testing,
                    notes: "User already has an appointment",
                    status: "confirmed",
                    duration_minutes: 30,
                    created_at: new Date(),
                    metadata: {},
                },
            ]);

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: false,
                error: "You already have another appointment at this time",
            });

            expect(prismaMock.appointments.create).not.toHaveBeenCalled();
        });

        it("should handle pet not found errors", async () => {
            // Override the mocked getPet function for this test only
            jest.requireMock("../../actions").getPet.mockResolvedValueOnce({
                success: false,
                error: "Pet not found",
            });

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: false,
                error: "Pet not found",
            });

            expect(prismaMock.appointments.create).not.toHaveBeenCalled();
        });
    });

    describe("getClinicAppointments", () => {
        it("should get all appointments for the current clinic", async () => {
            // Mock clinic data
            prismaMock.clinics.findFirst.mockResolvedValueOnce({
                clinic_id: 1,
                name: "Test Clinic",
                address: "123 Main St",
                city: "Test City",
                state: "TS",
                postal_code: "12345",
                phone_number: "123-456-7890",
                email: "clinic@example.com",
                clinic_uuid: "test-clinic-uuid",
                emergency_services: true,
                website: "https://testclinic.com",
                google_maps_url: "https://maps.google.com/testclinic",
                latitude: 12.345678,
                longitude: 98.765432,
                operating_hours: "",
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            });

            // Mock appointments data
            const mockAppointments = [
                {
                    appointment_id: 1,
                    appointment_uuid: "test-uuid-1",
                    appointment_date: new Date("2025-05-01T10:00:00"),
                    appointment_type: "CHECKUP",
                    notes: "Regular checkup",
                    status: "confirmed",
                    pet_id: 1,
                    vet_id: 1,
                    clinic_id: 1,
                    duration_minutes: 30,
                    created_at: new Date(),
                    updated_at: new Date(),
                    pets: {
                        pet_id: 1,
                        name: "Fluffy",
                        users: {
                            user_id: 2,
                            email: "user@example.com",
                            first_name: "John",
                            last_name: "Doe",
                        },
                    },
                    veterinarians: {
                        vet_id: 1,
                        users: {
                            user_id: 3,
                            first_name: "Dr",
                            last_name: "Smith",
                        },
                    },
                    clinics: {
                        clinic_id: 1,
                        name: "Test Clinic",
                    },
                },
            ];

            prismaMock.appointments.findMany.mockResolvedValueOnce(mockAppointments);

            const result = await getClinicAppointments();

            expect(result).toEqual({
                success: true,
                data: { appointments: mockAppointments },
            });

            expect(prismaMock.appointments.findMany).toHaveBeenCalledWith({
                where: {
                    clinic_id: 1,
                },
                include: expect.any(Object),
            });
        });

        it("should handle clinic not found", async () => {
            // Mock clinic not found
            prismaMock.clinics.findFirst.mockResolvedValueOnce(null);

            const result = await getClinicAppointments();

            expect(result).toEqual({
                success: false,
                error: "Clinic not found",
            });

            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            prismaMock.clinics.findFirst.mockRejectedValueOnce(new Error("Database error"));

            const result = await getClinicAppointments();

            expect(result).toEqual({
                success: false,
                error: "Database error",
            });

            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });
    });

    describe("getVeterinarianAppointments", () => {
        it("should get all appointments for the current veterinarian", async () => {
            // Set veterinarian session
            (getServerSession as jest.Mock).mockResolvedValue(mockVetSession);

            // Mock veterinarian data
            prismaMock.veterinarians.findFirst.mockResolvedValueOnce({
                vet_id: 1,
                user_id: 1,
                license_number: "VET123",
                specialization: veterinary_specialization.behaviorist,
                created_at: new Date(),
                vet_uuid: "test-vet-uuid",
            });

            // Mock appointments data
            const mockAppointments = [
                {
                    appointment_id: 1,
                    appointment_uuid: "test-uuid-1",
                    appointment_date: new Date("2025-05-01T10:00:00"),
                    appointment_type: "CHECKUP",
                    notes: "Regular checkup",
                    status: "confirmed",
                    pet_id: 1,
                    vet_id: 1,
                    clinic_id: 1,
                    duration_minutes: 30,
                    created_at: new Date(),
                    updated_at: new Date(),
                    pets: {
                        pet_id: 1,
                        name: "Fluffy",
                        users: {
                            user_id: 2,
                            email: "user@example.com",
                            first_name: "John",
                            last_name: "Doe",
                        },
                    },
                    veterinarians: {
                        vet_id: 1,
                        users: {
                            user_id: 1,
                            first_name: "Dr",
                            last_name: "Smith",
                        },
                    },
                },
            ];

            prismaMock.appointments.findMany.mockResolvedValueOnce(mockAppointments);

            const result = await getVeterinarianAppointments();

            expect(result).toEqual({
                success: true,
                data: { appointments: mockAppointments },
            });

            expect(prismaMock.appointments.findMany).toHaveBeenCalledWith({
                where: { vet_id: 1 },
                include: expect.any(Object),
            });
        });

        it("should handle veterinarian not found", async () => {
            // Mock veterinarian not found
            prismaMock.veterinarians.findFirst.mockResolvedValueOnce(null);

            const result = await getVeterinarianAppointments();

            expect(result).toEqual({
                success: false,
                error: "Veterinarian not found",
            });

            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });
    });

    describe("cancelAppointment", () => {
        const appointmentUuid = "test-appointment-uuid";

        it("should cancel an appointment successfully", async () => {
            // Mock the appointment update
            prismaMock.appointments.update.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: appointmentUuid,
                appointment_date: new Date("2025-05-01T10:00:00"),
                appointment_type: appointment_type.allergy_testing,
                notes: "Regular checkup",
                status: appointment_status.cancelled, // Updated status
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                duration_minutes: 30,
                created_at: new Date(),
                pets: {
                    pet_id: 1,
                    name: "Fluffy",
                    users: {
                        user_id: 2,
                        email: "user@example.com",
                        first_name: "John",
                        last_name: "Doe",
                    },
                },
                veterinarians: {
                    vet_id: 1,
                    users: {
                        user_id: 3,
                        first_name: "Dr",
                        last_name: "Smith",
                    },
                },
                clinics: {
                    clinic_id: 1,
                    name: "Test Clinic",
                },
            });

            const result = await cancelAppointment(appointmentUuid);

            expect(result).toEqual({
                success: true,
                data: { appointment_uuid: appointmentUuid },
            });

            expect(prismaMock.appointments.update).toHaveBeenCalledWith({
                where: { appointment_uuid: appointmentUuid },
                data: { status: "cancelled" },
                include: expect.any(Object),
            });
        });

        it("should handle appointment not found", async () => {
            // Mock appointment update with null (not found)
            prismaMock.appointments.update.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: appointmentUuid,
                appointment_date: new Date("2025-05-01T10:00:00"),
                appointment_type: appointment_type.allergy_testing,
                notes: "Regular checkup",
                status: "cancelled",
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                duration_minutes: 30,
                created_at: new Date(),
                pets: null, // Pet not found
                veterinarians: {
                    vet_id: 1,
                    users: {
                        user_id: 3,
                        first_name: "Dr",
                        last_name: "Smith",
                    },
                },
                clinics: {
                    clinic_id: 1,
                    name: "Test Clinic",
                },
            });

            const result = await cancelAppointment(appointmentUuid);

            expect(result).toEqual({
                success: false,
                error: "Pet not found",
            });
        });
    });

    describe("confirmAppointment", () => {
        const appointmentUuid = "test-appointment-uuid";

        it("should confirm an appointment successfully", async () => {
            // Mock the appointment update
            prismaMock.appointments.update.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: appointmentUuid,
                appointment_date: new Date("2025-05-01T10:00:00"),
                appointment_type: appointment_type.allergy_testing,
                notes: "Regular checkup",
                status: appointment_status.confirmed, // Updated status
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                duration_minutes: 30,
                created_at: new Date(),
                pets: {
                    pet_id: 1,
                    name: "Fluffy",
                    users: {
                        user_id: 2,
                        email: "user@example.com",
                        first_name: "John",
                        last_name: "Doe",
                    },
                },
                veterinarians: {
                    vet_id: 1,
                    users: {
                        user_id: 3,
                        first_name: "Dr",
                        last_name: "Smith",
                    },
                },
                clinics: {
                    clinic_id: 1,
                    name: "Test Clinic",
                    address: "123 Main St",
                    city: "Test City",
                    state: "TS",
                    postal_code: "12345",
                    phone_number: "123-456-7890",
                },
            });

            const result = await confirmAppointment(appointmentUuid);

            expect(result).toEqual({
                success: true,
                data: { appointment_uuid: appointmentUuid },
            });

            expect(prismaMock.appointments.update).toHaveBeenCalledWith({
                where: { appointment_uuid: appointmentUuid },
                data: { status: "confirmed" },
                include: expect.any(Object),
            });
        });

        it("should handle appointment with missing related data", async () => {
            // Mock appointment update with missing data
            prismaMock.appointments.update.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: appointmentUuid,
                appointment_date: new Date("2025-05-01T10:00:00"),
                appointment_type: appointment_type.allergy_testing,
                notes: "Regular checkup",
                status: "confirmed",
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                duration_minutes: 30,
                created_at: new Date(),
                pets: null, // Missing pet data
                veterinarians: {
                    vet_id: 1,
                    users: {
                        user_id: 3,
                        first_name: "Dr",
                        last_name: "Smith",
                    },
                },
                clinics: {
                    clinic_id: 1,
                    name: "Test Clinic",
                },
            });

            const result = await confirmAppointment(appointmentUuid);

            expect(result).toEqual({
                success: false,
                error: "Pet not found",
            });
        });
    });

    describe("rescheduleAppointment", () => {
        const appointmentUuid = "test-appointment-uuid";
        const newDate = new Date("2025-06-01T14:00:00");

        it("should reschedule an appointment successfully", async () => {
            // Mock getting current appointment
            prismaMock.appointments.findUnique.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: appointmentUuid,
                appointment_date: new Date("2025-05-01T10:00:00"), // Old date
                appointment_type: appointment_type.allergy_testing,
                notes: "Regular checkup",
                status: appointment_status.confirmed,
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                duration_minutes: 30,
                created_at: new Date(),
                pets: {
                    pet_id: 1,
                    name: "Fluffy",
                    users: {
                        user_id: 1, // Same as session user
                        email: "user@example.com",
                        first_name: "John",
                        last_name: "Doe",
                    },
                },
                veterinarians: {
                    vet_id: 1,
                    users: {
                        user_id: 3,
                        first_name: "Dr",
                        last_name: "Smith",
                    },
                },
                clinics: {
                    clinic_id: 1,
                    name: "Test Clinic",
                },
            });

            // Mock no scheduling conflicts
            prismaMock.appointments.findMany.mockResolvedValueOnce([]);
            prismaMock.appointments.findMany.mockResolvedValueOnce([]);

            // Mock update
            prismaMock.appointments.update.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: appointmentUuid,
                appointment_date: newDate, // New date
                appointment_type: appointment_type.allergy_testing,
                notes: "Rescheduled appointment",
                status: appointment_status.confirmed,
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                duration_minutes: 30,
                created_at: new Date(),
                pets: {
                    pet_id: 1,
                    name: "Fluffy",
                    users: {
                        user_id: 1,
                        email: "user@example.com",
                        first_name: "John",
                        last_name: "Doe",
                    },
                },
                veterinarians: {
                    vet_id: 1,
                    users: {
                        user_id: 3,
                        first_name: "Dr",
                        last_name: "Smith",
                    },
                },
                clinics: {
                    clinic_id: 1,
                    name: "Test Clinic",
                },
            });

            const result = await rescheduleAppointment(appointmentUuid, newDate, "Rescheduled appointment");

            // Function returns void on success
            expect(result).toBeUndefined();

            expect(prismaMock.appointments.update).toHaveBeenCalledWith({
                where: { appointment_uuid: appointmentUuid },
                data: {
                    appointment_date: newDate,
                    notes: "Rescheduled appointment",
                },
                include: expect.any(Object),
            });

            expect(revalidatePath).toHaveBeenCalled();
        });

        it("should handle scheduling conflicts", async () => {
            // Mock getting current appointment
            prismaMock.appointments.findUnique.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: appointmentUuid,
                appointment_date: new Date("2025-05-01T10:00:00"),
                appointment_type: appointment_type.allergy_testing,
                notes: "Regular checkup",
                status: appointment_status.confirmed,
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                duration_minutes: 30,
                created_at: new Date(),
                pets: {
                    pet_id: 1,
                    name: "Fluffy",
                    users: {
                        user_id: 1,
                        email: "user@example.com",
                        first_name: "John",
                        last_name: "Doe",
                    },
                },
                veterinarians: {
                    vet_id: 1,
                    users: {
                        user_id: 3,
                        first_name: "Dr",
                        last_name: "Smith",
                    },
                },
                clinics: {
                    clinic_id: 1,
                    name: "Test Clinic",
                },
            });

            // Mock conflicting appointments
            prismaMock.appointments.findMany.mockResolvedValueOnce([
                {
                    appointment_id: 2,
                    appointment_uuid: "another-appointment",
                    appointment_date: newDate,
                    status: "confirmed",
                    appointment_type: appointment_type.allergy_testing,
                    clinic_id: 1,
                    created_at: new Date(),
                    duration_minutes: 30,
                    metadata: {},
                    notes: "Another appointment",
                    pet_id: 2,
                    vet_id: 1,
                },
            ]);

            const result = await rescheduleAppointment(appointmentUuid, newDate);

            expect(result).toEqual({
                success: false,
                error: "There is a scheduling conflict at this time",
            });

            expect(prismaMock.appointments.update).not.toHaveBeenCalled();
        });

        it("should not allow rescheduling completed appointments", async () => {
            // Mock getting current appointment
            prismaMock.appointments.findUnique.mockResolvedValueOnce({
                appointment_id: 1,
                appointment_uuid: appointmentUuid,
                appointment_date: new Date("2025-05-01T10:00:00"),
                appointment_type: appointment_type.allergy_testing,
                notes: "Regular checkup",
                status: "completed", // Already completed
                pet_id: 1,
                vet_id: 1,
                clinic_id: 1,
                duration_minutes: 30,
                created_at: new Date(),
                pets: {
                    pet_id: 1,
                    name: "Fluffy",
                    users: {
                        user_id: 1,
                        email: "user@example.com",
                        first_name: "John",
                        last_name: "Doe",
                    },
                },
                veterinarians: {
                    vet_id: 1,
                    users: {
                        user_id: 3,
                        first_name: "Dr",
                        last_name: "Smith",
                    },
                },
                clinics: {
                    clinic_id: 1,
                    name: "Test Clinic",
                },
            });

            const result = await rescheduleAppointment(appointmentUuid, newDate);

            expect(result).toEqual({
                success: false,
                error: "Cannot reschedule a completed appointment",
            });

            expect(prismaMock.appointments.update).not.toHaveBeenCalled();
        });
    });

    describe("getExistingAppointments", () => {
        it("should get existing appointments for a veterinarian on a specific date", async () => {
            const date = new Date("2025-05-01");
            const vetId = 1;

            const mockAppointments = [
                {
                    appointment_date: new Date("2025-05-01T10:00:00"),
                    duration_minutes: 30,
                    appointment_uuid: "test-uuid-1",
                    status: "confirmed",
                },
                {
                    appointment_date: new Date("2025-05-01T14:30:00"),
                    duration_minutes: 45,
                    appointment_uuid: "test-uuid-2",
                    status: "requested",
                },
            ];

            prismaMock.appointments.findMany.mockResolvedValueOnce(mockAppointments);

            const result = await getExistingAppointments(date, vetId);

            expect(result).toEqual({
                success: true,
                data: { appointments: mockAppointments },
            });

            expect(prismaMock.appointments.findMany).toHaveBeenCalledWith({
                where: {
                    vet_id: vetId,
                    appointment_date: {
                        gte: expect.any(Date), // start of day
                        lte: expect.any(Date), // end of day
                    },
                    status: { not: "cancelled" },
                },
                select: {
                    appointment_date: true,
                    duration_minutes: true,
                    appointment_uuid: true,
                    status: true,
                },
            });
        });

        it("should handle database errors", async () => {
            const date = new Date("2025-05-01");
            const vetId = 1;

            prismaMock.appointments.findMany.mockRejectedValueOnce(new Error("Database error"));

            const result = await getExistingAppointments(date, vetId);

            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });
});
