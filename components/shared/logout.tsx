"use client";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { notificationSynchronizer } from "@/lib/notification";

function LogoutButton() {
    const handleLogout = async () => {
        // Clear all pending notifications before logging out
        notificationSynchronizer.clearAllNotificationsOnLogout();

        // Proceed with logout
        await signOut({ callbackUrl: "/signin" });
    };

    return (
        <Button onClick={handleLogout} variant={"ghost"} size={"sm"}>
            <LogOut />
            Log out
        </Button>
    );
}

export default LogoutButton;
