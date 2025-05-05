"use client";

import { Appointment } from "../types/appointment";
import notificationService from "../notification-service";

// Types for scheduled notifications
export interface ScheduledNotification {
    id: string;
    appointmentId: string;
    title: string;
    body: string;
    scheduledTime: number; // Unix timestamp
    timeoutId: NodeJS.Timeout | null;
}

class NotificationScheduler {
    private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

    // Schedule a notification for a specific time
    scheduleNotification(appointmentId: string, title: string, body: string, scheduledTime: number): string {
        const id = `notification_${appointmentId}_${scheduledTime}`;

        // Calculate delay in milliseconds
        const now = Date.now();
        const delay = Math.max(0, scheduledTime - now);

        // Create a timeout to show the notification at the scheduled time
        const timeoutId = setTimeout(async () => {
            await this.showNotification(id, title, body);
            this.removeScheduledNotification(id);
        }, delay);

        // Store the scheduled notification
        const notification: ScheduledNotification = {
            id,
            appointmentId,
            title,
            body,
            scheduledTime,
            timeoutId,
        };

        this.scheduledNotifications.set(id, notification);
        return id;
    }

    // Show a notification immediately
    async showNotification(id: string, title: string, body: string): Promise<boolean> {
        try {
            return await notificationService.showNotification({
                title,
                body,
                tag: id, // Use the notification ID as the tag
            });
        } catch (error) {
            console.error("Error showing notification:", error);
            return false;
        }
    }

    // Schedule notifications for an appointment
    scheduleAppointmentNotifications(appointment: Appointment): string[] {
        const notificationIds: string[] = [];

        if (!appointment.appointment_date) {
            return notificationIds;
        }

        const appointmentTime = new Date(appointment.appointment_date).getTime();
        const petName = appointment.pets?.name || "your pet";
        const appointmentType = appointment.appointment_type || "appointment";

        // Schedule a notification for 60 minutes before the appointment
        const advanceNotificationTime = appointmentTime - 60 * 60 * 1000; // 60 minutes in milliseconds
        const advanceId = this.scheduleNotification(
            appointment.appointment_uuid,
            "Upcoming Appointment Reminder",
            `You have an appointment for ${petName} in 1 hour for ${appointmentType}.`,
            advanceNotificationTime,
        );
        notificationIds.push(advanceId);

        // Schedule a notification at the time of the appointment
        const mainId = this.scheduleNotification(
            appointment.appointment_uuid,
            "Appointment Now",
            `Your ${appointmentType} appointment for ${petName} is now.`,
            appointmentTime,
        );
        notificationIds.push(mainId);

        return notificationIds;
    }

    // Cancel a scheduled notification
    cancelNotification(id: string): boolean {
        const notification = this.scheduledNotifications.get(id);
        if (notification && notification.timeoutId) {
            clearTimeout(notification.timeoutId);
            this.scheduledNotifications.delete(id);
            return true;
        }
        return false;
    }

    // Remove a notification from the map (after it's shown)
    private removeScheduledNotification(id: string): void {
        this.scheduledNotifications.delete(id);
    }

    // Cancel all notifications for a specific appointment
    cancelAppointmentNotifications(appointmentId: string): number {
        let count = 0;

        // Find all notifications for this appointment
        this.scheduledNotifications.forEach((notification, id) => {
            if (notification.appointmentId === appointmentId) {
                if (this.cancelNotification(id)) {
                    count++;
                }
            }
        });

        return count;
    }

    // Cancel all scheduled notifications (e.g., on logout)
    cancelAllNotifications(): number {
        let count = 0;

        this.scheduledNotifications.forEach((notification, id) => {
            if (this.cancelNotification(id)) {
                count++;
            }
        });

        return count;
    }

    // Get all scheduled notifications (for debugging or UI)
    getAllScheduledNotifications(): ScheduledNotification[] {
        return Array.from(this.scheduledNotifications.values());
    }
}

// Create a singleton instance
const notificationScheduler = new NotificationScheduler();
export default notificationScheduler;
