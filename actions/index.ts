export { addPet, getPet, updatePet, getPets } from "./pets";
export { getClinics, getNearbyClinics } from "./clinic";
export {
    createAccount,
    createClinicAccount,
    regenerateOTPToken,
    loginAccount,
    logout,
    nextAuthLogin,
    verifyEmail,
    verifyOTPToken,
} from "./auth";
export { newVeterinarian, getClinicVeterinarians, getVeterinariansByClinic } from "./veterinary";
export {
    getExistingAppointments,
    getUserAppointments,
    createUserAppointment,
    acceptAppointment,
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
export { sendEmail, sendSimpleEmail } from "./send-email";
