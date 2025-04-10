export { addPet, getPet, updatePet, getPets, getPetId } from "./pets";
export { getClinics, getNearbyClinics, getClinic } from "./clinic";
export {
    createAccount,
    createClinicAccount,
    regenerateOTPToken,
    loginAccount,
    logout,
    nextAuthLogin,
    verifyEmail,
    verifyOTPToken,
    isEmailTaken,
} from "./auth";
export { newVeterinarian, getClinicVeterinarians, getVeterinariansByClinic } from "./veterinary";
export {
    getExistingAppointments,
    getUserAppointments,
    createUserAppointment,
    confirmAppointment,
    cancelAppointment,
    getAppointment,
    getClinicAppointments,
    getVeterinarianAppointments,
    changeAppointmentStatus,
} from "./appointment";
export { getUserId } from "./user";
export { getVeterinaryAvailability } from "./veterinarian-availability";
export { createVaccination, getPetVaccinations } from "./vaccination";
//export {} from "./medical-records";
//export {} from "./health-monitoring";
export { addHealthcareProcedure, getHealthcareProcedure, getHealthcareProcedures } from "./healthcare-procedures";
export { getClinicSchedule } from "./clinic-schedule";
export { createMedication, getMedicationsList } from "./medications";
export { sendEmail, sendSimpleEmail } from "./send-email";
