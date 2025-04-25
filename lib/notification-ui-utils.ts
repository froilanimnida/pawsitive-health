import { Bell, Calendar, MessageCircle, Pill, Shield, Stethoscope, Syringe } from "lucide-react";

function getNotificationIcon(type: string) {
    if (type.includes("appointment")) return Calendar;
    if (type.includes("medication")) return Pill;
    if (type.includes("vaccine")) return Syringe;
    if (type.includes("health")) return Stethoscope;
    if (type.includes("message") || type.includes("forum")) return MessageCircle;
    if (type.includes("security")) return Shield;
    return Bell;
}

// Helper function to get notification color based on type
function getNotificationColor(type: string): string {
    if (type.includes("appointment")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
    if (type.includes("medication")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
    if (type.includes("vaccine")) return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
    if (type.includes("health_alert")) return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300";
    if (type.includes("health")) return "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300";
    if (type.includes("message") || type.includes("forum"))
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
    if (type.includes("security")) return "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}
export { getNotificationIcon, getNotificationColor };
