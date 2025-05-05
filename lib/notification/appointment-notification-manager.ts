"use client";

import notificationService from "../notification-service";
import { toast } from "sonner";

export interface AppointmentNotification {
    id: string;
    title: string;
    body: string;
    appointmentId: string;
    appointmentTime: Date;
    reminderMinutes: number;
    notificationType: "appointment" | "reminder";
    petName: string;
    vetName?: string;
    clinicName?: string;
    actionUrl?: string;
}

type ScheduledNotification = {
    timeoutId: number;
    notification: AppointmentNotification;
};

/**
 * AppointmentNotificationManager handles scheduling and managing appointment notifications
 */
class AppointmentNotificationManager {
    private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
    private initialized = false;

    /**
     * Initialize the notification manager
     */
    async init(): Promise<boolean> {
        if (this.initialized) return true;

        const permissionStatus = await notificationService.getPermissionStatus();
        if (permissionStatus !== "granted") {
            return false;
        }

        const serviceInitialized = await notificationService.init();
        if (!serviceInitialized) {
            return false;
        }

        this.initialized = true;
        return true;
    }

    /**
     * Schedule notifications for appointments
     * @param appointments List of appointments to schedule notifications for
     */
    async scheduleAppointmentNotifications(appointments: AppointmentNotification[]): Promise<void> {
        if (!this.initialized) {
            const initialized = await this.init();
            if (!initialized) return;
        }

        // Clear any existing scheduled notifications to avoid duplicates
        this.clearAllScheduledNotifications();

        // Schedule new notifications
        appointments.forEach((appointment) => {
            this.scheduleNotification(appointment);

            // Schedule reminder notification if reminderMinutes > 0
            if (appointment.reminderMinutes > 0) {
                const reminderNotification: AppointmentNotification = {
                    ...appointment,
                    id: `${appointment.id}-reminder`,
                    title: `Reminder: ${appointment.title}`,
                    body: `Reminder for your appointment${appointment.petName ? ` with ${appointment.petName}` : ""} in ${appointment.reminderMinutes} minutes`,
                    notificationType: "reminder",
                };
                this.scheduleNotification(reminderNotification);
            }
        });

        // Log scheduled notifications (for debugging)
        console.log(`Scheduled ${this.scheduledNotifications.size} notifications`);
    }

    /**
     * Schedule a single notification
     * @param notification The notification to schedule
     */
    private scheduleNotification(notification: AppointmentNotification): void {
        const now = new Date().getTime();
        let scheduledTime = new Date(notification.appointmentTime).getTime();

        // If it's a reminder notification, subtract the reminder minutes
        if (notification.notificationType === "reminder") {
            scheduledTime -= notification.reminderMinutes * 60 * 1000;
        }

        // Check if the notification is in the future
        if (scheduledTime <= now) {
            return; // Don't schedule past notifications
        }

        // Calculate delay in milliseconds
        const delay = scheduledTime - now;

        // Schedule the notification
        const timeoutId = window.setTimeout(() => {
            this.showNotification(notification);
            this.scheduledNotifications.delete(notification.id);
        }, delay);

        // Store the scheduled notification
        this.scheduledNotifications.set(notification.id, {
            timeoutId,
            notification,
        });
    }

    /**
     * Show a notification using the notification service
     * @param notification The notification to show
     */
    private async showNotification(notification: AppointmentNotification): Promise<void> {
        try {
            const notificationShown = await notificationService.showNotification({
                title: notification.title,
                body: notification.body,
                tag: `appointment-${notification.appointmentId}`,
                data: {
                    primaryAction: {
                        url: notification.actionUrl || `/user/appointments/${notification.appointmentId}`,
                    },
                    appointmentId: notification.appointmentId,
                    notificationType: notification.notificationType,
                },
            });

            if (!notificationShown) {
                toast.error("Failed to show notification");
            }
        } catch (error) {
            console.error("Error showing notification:", error);
            toast.error("Error showing notification");
        }
    }

    /**
     * Clear all scheduled notifications
     */
    clearAllScheduledNotifications(): void {
        this.scheduledNotifications.forEach(({ timeoutId }) => {
            window.clearTimeout(timeoutId);
        });
        this.scheduledNotifications.clear();
    }

    /**
     * Get the count of scheduled notifications
     */
    getScheduledNotificationsCount(): number {
        return this.scheduledNotifications.size;
    }
}

// Create a singleton instance
const appointmentNotificationManager = new AppointmentNotificationManager();
export default appointmentNotificationManager;
