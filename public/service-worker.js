/* PawsitiveHealth Service Worker */
const CACHE_NAME = "pawsitive-health-v1";

// Assets to cache
const STATIC_ASSETS = ["/", "/favicon.ico"];

// Install event - Pre-cache assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting()),
    );
});

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
    const currentCaches = [CACHE_NAME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter(
                    (cacheName) => !currentCaches.includes(cacheName),
                );
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    }),
                );
            })
            .then(() => self.clients.claim()),
    );
});

// Notification click event - Handle user interaction
self.addEventListener("notificationclick", (event) => {
    const notification = event.notification;
    const action = event.action;
    const primaryAction = notification.data?.primaryAction;

    notification.close();

    // Handle action buttons
    if (action === "view") {
        if (primaryAction?.url) {
            event.waitUntil(clients.openWindow(primaryAction.url));
        }
    } else if (action === "dismiss") {
        // Just close the notification
    } else {
        // Default action (clicking the notification body)
        if (primaryAction?.url) {
            event.waitUntil(clients.openWindow(primaryAction.url));
        }
    }
});

// Push event - Receive and show push notifications
self.addEventListener("push", (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const options = {
            body: data.body || "New notification from PawsitiveHealth",
            icon: data.icon || "/favicon.ico",
            badge: data.badge || "/favicon.ico",
            data: {
                primaryAction: data.primaryAction || {},
                timestamp: data.timestamp || Date.now(),
            },
            actions: [
                {
                    action: "view",
                    title: "View",
                },
                {
                    action: "dismiss",
                    title: "Dismiss",
                },
            ],
        };

        event.waitUntil(
            self.registration.showNotification(
                data.title || "PawsitiveHealth",
                options,
            ),
        );
    } catch {
        // Fallback for non-JSON push messages
        event.waitUntil(
            self.registration.showNotification("PawsitiveHealth", {
                body: event.data.text(),
                icon: "/favicon.ico",
            }),
        );
    }
});

// Background sync event - Handle offline operations
self.addEventListener("sync", (event) => {
    if (event.tag === "appointment-update") {
        event.waitUntil(syncAppointmentData());
    } else if (event.tag === "pet-health-update") {
        event.waitUntil(syncPetHealthData());
    }
});

// Helper functions for background sync
async function syncAppointmentData() {
    // Implement logic to sync appointment data when back online
    try {
        await getPendingRequests("appointments");
        // Process pending requests...
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

async function syncPetHealthData() {
    // Implement logic to sync pet health data when back online
    try {
        await getPendingRequests("pet-health");
        // Process pending requests...
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

async function getPendingRequests() {
    // This would be implemented with IndexedDB in a complete solution
    return [];
}
