import { notification_type, notification_priority } from "@prisma/client";

/**
 * Type for notification relationships with nested entities
 */
type NotificationWithRelations = {
    notification_id: number;
    notification_uuid: string;
    user_id: number | null;
    title: string;
    content: string;
    type: notification_type;
    is_read: boolean | null;
    created_at: Date | null;
    pet_id: number | null;
    appointment_id: number | null;
    forum_post_id: number | null;
    expires_at: Date | null;
    action_url: string | null;
    priority: notification_priority;
    pets?: {
        name: string;
        profile_picture_url: string | null;
        pet_uuid: string;
    } | null;
    appointments?: {
        appointment_uuid: string;
        appointment_date: Date;
    } | null;
    forum_posts?: {
        post_uuid: string;
        title: string;
    } | null;
};

/**
 * Type for notification list results with pagination
 */
interface NotificationsResult {
    notifications: NotificationWithRelations[];
    totalCount: number;
    hasMore: boolean;
}

/**
 * Props for creating a new notification
 */
interface CreateNotificationProps {
    userId: number;
    title: string;
    content: string;
    type: notification_type;
    petId?: number;
    appointmentId?: number;
    forumPostId?: number;
    expiresAt?: Date;
    actionUrl?: string;
    priority?: notification_priority;
}

/**
 * Type for notification filter parameters
 */
interface NotificationFilters {
    page?: number;
    pageSize?: number;
    type?: notification_type;
    isRead?: boolean;
    priority?: notification_priority;
}

/**
 * Props for the notification card component
 */
interface NotificationCardProps {
    notification: NotificationWithRelations;
    onRead?: (uuid: string) => void;
    onDelete?: (uuid: string) => void;
}

interface CreateNotificationProps {
    userId: number;
    title: string;
    content: string;
    type: notification_type;
    petId?: number;
    appointmentId?: number;
    forumPostId?: number;
    expiresAt?: Date;
    actionUrl?: string;
    priority?: notification_priority;
}

/**
 * Group notification types by category
 */
const notificationTypeGroups: Record<string, notification_type[]> = {
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

export {
    type NotificationWithRelations,
    type NotificationsResult,
    type CreateNotificationProps,
    type NotificationFilters,
    type NotificationCardProps,
    notificationTypeGroups,
};
