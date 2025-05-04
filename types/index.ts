export type { UUIDPageParams } from "./pages/common-page-params";
export type { PrescriptionData } from "./pages/user/pets/pet-history-table";
export type {
    AppointmentDetailsResponse,
    GetUserAppointmentsResponse,
    GetExistingAppointmentsType,
    GetVeterinarianAppointmentsType,
    VetAppointmentWithRelations,
    AppointmentWithRelations,
} from "./actions/appointments";
export type { EmailOptions, EmailTemplate } from "./email-types";
export { CatBreeds, DogBreeds } from "./breed-types";
export type { HealthMonitoring } from "./actions/healthcare-monitoring";
export type { EducationalContentFilters } from "./actions/educational-content";
export type {
    UpcomingVaccination,
    UpcomingVaccinationsResponse,
    UpcomingPrescription,
    UpcomingPrescriptionsResponse,
    DashboardHealthcareResponse,
} from "./actions/dashboard-healthcare";
export {
    type NotificationWithRelations,
    type NotificationsResult,
    type CreateNotificationProps,
    type NotificationFilters,
    type NotificationCardProps,
    notificationTypeGroups,
} from "./actions/notification";
export type { ActionResponse } from "./server-action-response";
export type { Pets } from "./pets";
export type { Modify } from "./modify";
