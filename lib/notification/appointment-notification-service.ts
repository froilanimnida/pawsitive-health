"use client";

import notificationScheduler from "./notification-scheduler";
import { Appointment } from "../types/appointment";

class AppointmentNotificationService {
    // Fetch upcoming appointments from the server
    async fetchUpcomingAppointments(): Promise<Appointment[]> {
        try {
            // Fetch appointments that are coming up (not past, not cancelled)
            const response = await fetch("/api/appointments/upcoming", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch upcoming appointments");
            }

            const data = await response.json();
            return data.appointments || [];
        } catch (error) {
            console.error("Error fetching upcoming appointments:", error);
            return [];
        }
    }

    // Schedule notifications for all upcoming appointments
    async scheduleAllAppointmentNotifications(): Promise<void> {
        try {
            // Fetch upcoming appointments
            const appointments = await this.fetchUpcomingAppointments();

            // Schedule notifications for each appointment
            if (appointments.length > 0) {
                console.log(`Scheduling notifications for ${appointments.length} upcoming appointments`);

                for (const appointment of appointments) {
                    // Only schedule notifications for appointments in the future
                    console.log(`Scheduling notification for appointment ID: ${appointment.appointment_id}`);
                    const appointmentTime = new Date(appointment.appointment_date).getTime();
                    const now = Date.now();

                    if (appointmentTime > now) {
                        notificationScheduler.scheduleAppointmentNotifications(appointment);
                    }
                }
            }
        } catch (error) {
            console.error("Error scheduling appointment notifications:", error);
        }
    }

    // Cancel all scheduled appointment notifications
    cancelAllAppointmentNotifications(): void {
        notificationScheduler.cancelAllNotifications();
    }
}

// Create a singleton instance
const appointmentNotificationService = new AppointmentNotificationService();
export default appointmentNotificationService;
