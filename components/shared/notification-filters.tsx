"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Badge,
    Button,
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import { Check, Filter, X } from "lucide-react";
import { useCallback } from "react";

const notificationTypeGroups = {
    Appointments: [
        "appointment_reminder",
        "appointment_confirmation",
        "appointment_cancelled",
        "appointment_rescheduled",
    ],
    Medications: ["medication_reminder", "medication_refill_needed", "medication_started", "medication_completed"],
    Vaccines: ["vaccine_due", "vaccine_overdue", "vaccine_administered"],
    Health: ["health_alert", "health_checkup_due", "lab_results_ready", "medical_record_updated"],
    Social: ["pet_birthday", "forum_reply", "forum_mention", "message_received", "document_shared"],
    System: ["account_security", "system_maintenance"],
};

// Helper function to convert notification_type enum to readable text
function formatNotificationType(type: string): string {
    return type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

interface NotificationFiltersProps {
    totalCount: number;
}

export function NotificationFilters({ totalCount }: NotificationFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get current filter values
    const currentType = searchParams.get("type");
    const currentStatus = searchParams.get("status") || "all";

    // Create a new URL with updated search params
    const createQueryString = useCallback(
        (name: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());

            if (value === null) {
                params.delete(name);
            } else {
                params.set(name, value);
            }

            // Reset to page 1 when filters change
            if (name !== "page") {
                params.delete("page");
            }

            return params.toString();
        },
        [searchParams],
    );

    // Set filter and update URL
    const setFilter = (name: string, value: string | null) => {
        router.push(`${pathname}?${createQueryString(name, value)}`);
    };

    // Handle type filter selection
    const handleTypeSelect = (type: string | null) => {
        setFilter("type", type);
    };

    // Handle status filter change
    const handleStatusChange = (status: string) => {
        setFilter("status", status);
    };

    return (
        <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold">
                    Notifications
                    <Badge className="ml-2 text-xs" variant="secondary">
                        {totalCount}
                    </Badge>
                </h1>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                                {currentType && (
                                    <Badge variant="secondary" className="ml-1 px-1">
                                        1
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[240px]">
                            <div className="flex items-center justify-between px-2 py-2">
                                <span className="text-sm font-medium">Notification Type</span>
                                {currentType && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-xs"
                                        onClick={() => handleTypeSelect(null)}
                                    >
                                        <X className="mr-1 h-3 w-3" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                            {Object.entries(notificationTypeGroups).map(([group, types]) => (
                                <DropdownMenuGroup key={group}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                        {group}
                                    </div>
                                    {types.map((type) => (
                                        <DropdownMenuItem
                                            key={type}
                                            onClick={() => handleTypeSelect(type)}
                                            className="flex items-center justify-between"
                                        >
                                            <span>{formatNotificationType(type)}</span>
                                            {currentType === type && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs
                defaultValue={currentStatus}
                className="w-full"
                onValueChange={handleStatusChange}
                value={currentStatus}
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="read">Read</TabsTrigger>
                </TabsList>
            </Tabs>

            {currentType && (
                <div className="flex items-center">
                    <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border-none gap-1">
                        {formatNotificationType(currentType)}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleTypeSelect(null)} />
                    </Badge>
                </div>
            )}
        </div>
    );
}
