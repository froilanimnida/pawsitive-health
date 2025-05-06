"use client";

import appointmentNotificationService from "./appointment-notification-service";
import notificationScheduler from "./notification-scheduler";

/**
 * NotificationSynchronizer coordinates different notification types and services
 * This makes the system modular and extensible for future notification types
 */
class NotificationSynchronizer {
    /**
     * Sync all notification types on login
     * This is non-blocking and should be called after successful login
     */
    async syncAllNotificationsOnLogin(): Promise<void> {
        try {
            // Check if notifications are supported and permission is granted
            if (!("Notification" in window) || Notification.permission !== "granted") {
                return;
            }

            // Start sync in the background without blocking the main thread
            this.backgroundSync();
        } catch (error) {
            console.error("Error syncing notifications on login:", error);
        }
    }

    /**
     * Performs synchronization in the background without blocking
     */
    private async backgroundSync(): Promise<void> {
        // Using setTimeout with 0ms to move to the next event loop tick
        // This prevents blocking the login process
        setTimeout(async () => {
            try {
                // Sync appointments and schedule notifications
                await appointmentNotificationService.scheduleAllAppointmentNotifications();

                // Add more notification types here as the system grows
                // await otherNotificationService.syncNotifications();
            } catch (error) {
                console.error("Background notification sync error:", error);
            }
        }, 0);
    }

    /**
     * Clear all notifications on logout
     */
    clearAllNotificationsOnLogout(): void {
        try {
            // Cancel all scheduled notifications
            notificationScheduler.cancelAllNotifications();

            // Add more notification types here as needed
            // otherNotificationService.cancelAllNotifications();

            console.log("All notifications cleared on logout");
        } catch (error) {
            console.error("Error clearing notifications on logout:", error);
        }
    }
}

// Create a singleton instance
export const notificationSynchronizer = new NotificationSynchronizer();
export default notificationSynchronizer;
