export { addPet, getPet, updatePet, getPets } from "./pets";
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
} from "./appointment";
export { getUserId } from "./user";
export { getVeterinaryAvailability } from "./veterinarian-availability";
//export {} from "./vaccinations";
//export {} from "./medical-records";
//export {} from "./health-monitoring";
export { getClinicSchedule } from "./clinic-schedule";
export { createMedication, getMedicationsList } from "./medications";
export { sendEmail, sendSimpleEmail } from "./send-email";
