"use client";

interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: string;
    vibrate?: number[];
    tag?: string;
    data?: unknown;
}

class NotificationService {
    private swRegistration: ServiceWorkerRegistration | null = null;
    private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

    /**
     * Initialize the service worker
     */
    public async init(): Promise<boolean> {
        if (!this.isPushSupported()) {
            console.log("Push notifications not supported");
            return false;
        }

        try {
            // Register the service worker
            const registration = await navigator.serviceWorker.register("/service-worker.js");

            // Wait for the service worker to be ready and active
            await navigator.serviceWorker.ready;

            this.swRegistration = registration;

            // Make sure we have an active service worker
            if (!registration.active) {
                console.log("Waiting for service worker to become active...");

                // Wait for the active service worker
                return new Promise((resolve) => {
                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing;
                        if (!newWorker) {
                            resolve(false);
                            return;
                        }

                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "activated") {
                                resolve(true);
                            }
                        });
                    });

                    // If already installed but not active yet
                    if (registration.installing) {
                        registration.installing.addEventListener("statechange", (e) => {
                            if ((e.target as ServiceWorker).state === "activated") {
                                resolve(true);
                            }
                        });
                    }

                    // If already active, no need to wait
                    if (registration.active) {
                        resolve(true);
                    }
                });
            }

            return true;
        } catch (error) {
            console.error("Service Worker registration failed:", error);
            return false;
        }
    }

    /**
     * Check if push notifications are supported
     */
    public isPushSupported(): boolean {
        return "serviceWorker" in navigator && "PushManager" in window;
    }

    /**
     * Get the current notification permission status
     */
    public async getPermissionStatus(): Promise<NotificationPermission> {
        if (!("Notification" in window)) {
            return "denied";
        }
        return Notification.permission;
    }

    /**
     * Request permission for notifications
     */
    public async requestPermission(): Promise<boolean> {
        if (!("Notification" in window)) {
            console.log("Notifications not supported");
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            return false;
        }
    }

    /**
     * Show a notification
     */
    public async showNotification(options: NotificationOptions): Promise<boolean> {
        if (!this.swRegistration || !this.swRegistration.active) {
            await this.init();
            if (!this.swRegistration || !this.swRegistration.active) return false;
        }

        try {
            await this.swRegistration.showNotification(options.title, {
                body: options.body,
                icon: options.icon || "/favicon.ico",
                badge: options.badge,
                data: options.data || {},
                tag: options.tag,
            });
            return true;
        } catch (error) {
            console.error("Error showing notification:", error);
            return false;
        }
    }

    public async subscribeUserToPush(): Promise<PushSubscription | null> {
        if (!this.swRegistration || !this.swRegistration.active) {
            await this.init();
            if (!this.swRegistration || !this.swRegistration.active) return null;
        }

        try {
            console.log(this.vapidPublicKey);
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
            });

            console.log("User is subscribed:", subscription);
            return subscription;
        } catch (error) {
            console.error("Failed to subscribe user:", error);
            return null;
        }
    }
    /**
     * Convert a base64 string to a Uint8Array for the applicationServerKey
     */
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        if (!base64String) {
            console.error("Empty VAPID key provided");
            return new Uint8Array(0);
        }

        try {
            // Remove any whitespace
            const trimmedBase64 = base64String.trim();

            // Add padding if necessary
            const padding = "=".repeat((4 - (trimmedBase64.length % 4)) % 4);
            const base64 = (trimmedBase64 + padding).replace(/-/g, "+").replace(/_/g, "/");

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }

            return outputArray;
        } catch (error) {
            console.error("Error converting VAPID key:", error);
            throw new Error("Invalid VAPID public key format");
        }
    }

    /**
     * Send subscription to server (to be implemented based on your backend)
     */
    private async sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
        console.log("Sending subscription to server:", subscription);
        // Implement this method to send the subscription to your server
        // Example:
        // try {
        //   const response = await fetch('/api/push/subscribe', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(subscription)
        //   });
        //   return response.ok;
        // } catch (error) {
        //   console.error('Error sending subscription to server:', error);
        //   return false;
        // }
        return true;
    }
}

// Create a singleton instance
const notificationService = new NotificationService();
export default notificationService;
