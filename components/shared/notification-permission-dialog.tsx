"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import notificationService from "@/lib/notification-service";
import { Bell } from "lucide-react";
import { toast } from "sonner";

interface NotificationPermissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NotificationPermissionDialog({ open, onOpenChange }: NotificationPermissionDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleAllowNotifications = async () => {
        setLoading(true);
        try {
            const initialized = await notificationService.init();
            if (!initialized) {
                toast.error("Failed to initialize notifications");
                return;
            }

            const permissionGranted = await notificationService.requestPermission();
            if (!permissionGranted) {
                toast.error("Notification permission denied");
                return;
            }

            const subscription = await notificationService.subscribeUserToPush();
            if (!subscription) {
                toast.error("Failed to subscribe to notifications");
                return;
            }

            // Show a welcome notification
            const notificationShown = await notificationService.showNotification({
                title: "Notifications Enabled",
                body: "You'll now receive important updates about your pet's healthcare.",
                icon: "/favicon.ico",
            });

            if (notificationShown) {
                toast.success("Notifications enabled successfully");
            }
        } catch (error) {
            console.error("Error enabling notifications:", error);
            toast.error("Failed to enable notifications");
        } finally {
            setLoading(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Bell className="h-6 w-6 text-blue-500" />
                        <span>Enable Notifications</span>
                    </DialogTitle>
                    <DialogDescription>
                        Get notified about appointment reminders, medication schedules, and important updates for your
                        pet&apos;s healthcare.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6">
                    <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="font-medium text-blue-700 mb-2">Why enable notifications?</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-blue-800">
                            <li>Never miss an appointment</li>
                            <li>Get medication reminders</li>
                            <li>Receive important healthcare alerts</li>
                            <li>Stay updated on your pet&apos;s care</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-between flex-row mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Maybe Later
                    </Button>
                    <Button onClick={handleAllowNotifications} disabled={loading} className="gap-2">
                        {loading ? "Enabling..." : "Enable Notifications"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
