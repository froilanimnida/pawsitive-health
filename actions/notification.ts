"use server";
import { notifications } from "@prisma/client";
import { prisma } from "@/lib";
import { redirect } from "next/navigation";
import type {
    NotificationFilters,
    ActionResponse,
    NotificationWithRelations,
    NotificationsResult,
    CreateNotificationProps,
} from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const getUserNotifications = async ({ page = 1, pageSize = 10, type, isRead }: NotificationFilters = {}): Promise<
    ActionResponse<NotificationsResult>
> => {
    try {
        const user = await getServerSession(authOptions);
        if (!user || !user.user?.id) redirect("/signin");
        const whereCondition = {
            user_id: Number(user.user.id),
            ...(type !== undefined ? { type } : {}),
            ...(isRead !== undefined ? { is_read: isRead } : {}),
        };

        // Get total count for pagination
        const totalCount = await prisma.notifications.count({ where: whereCondition });

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const notificationsList = await prisma.notifications.findMany({
            where: whereCondition,
            orderBy: [
                { priority: "desc" },
                { created_at: "desc" }, // Then by creation date
            ],
            include: {
                pets: {
                    select: {
                        name: true,
                        profile_picture_url: true,
                        pet_uuid: true,
                    },
                },
                appointments: {
                    select: {
                        appointment_uuid: true,
                        appointment_date: true,
                    },
                },
                forum_posts: {
                    select: {
                        post_uuid: true,
                        title: true,
                    },
                },
            },
            skip,
            take,
        });

        return {
            success: true,
            data: {
                notifications: notificationsList,
                totalCount,
                hasMore: skip + take < totalCount,
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const markNotificationAsRead = async (notificationUuid: string): Promise<ActionResponse<boolean>> => {
    try {
        const user = await getServerSession(authOptions);
        if (!user || user.user?.id === undefined) redirect("/signin");
        const notification = await prisma.notifications.findFirst({
            where: { notification_uuid: notificationUuid, user_id: Number(user.user?.id) },
        });

        if (!notification) return { success: false, error: "Notification not found" };
        if (!notification) return { success: false, error: "Notification not found" };
        await prisma.notifications.update({
            where: {
                notification_id: notification.notification_id,
            },
            data: {
                is_read: true,
            },
        });

        return { success: true, data: true };
        return { success: true, data: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const getUserNotification = async (notificationUuid: string): Promise<ActionResponse<NotificationWithRelations>> => {
    try {
        const user = await getServerSession(authOptions);
        if (!user || user.user?.id === undefined) redirect("/signin");
        const notification = await prisma.notifications.findFirst({
            where: {
                notification_uuid: notificationUuid,
                user_id: Number(user.user?.id),
            },
            include: {
                pets: true,
                appointments: true,
                forum_posts: true,
            },
        });
        if (!notification) {
            return {
                success: false,
                error: "Notification not found",
            };
        }
        return {
            success: true,
            data: notification,
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Create a new notification with improved relationship support
 */
const createNotification = async ({
    userId,
    title,
    content,
    type,
    petId,
    appointmentId,
    forumPostId,
    expiresAt,
    actionUrl,
    priority = "normal",
}: CreateNotificationProps): Promise<ActionResponse<notifications>> => {
    try {
        const notification = await prisma.notifications.create({
            data: {
                user_id: userId,
                title,
                content,
                type,
                pet_id: petId,
                appointment_id: appointmentId,
                forum_post_id: forumPostId,
                expires_at: expiresAt,
                action_url: actionUrl,
                priority,
            },
        });

        return {
            success: true,
            data: notification,
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Mark all notifications as read for a user
 */
const markAllNotificationsAsRead = async (): Promise<ActionResponse<boolean>> => {
    try {
        const user = await getServerSession(authOptions);
        if (!user || user.user?.id === undefined) redirect("/signin");

        await prisma.notifications.updateMany({
            where: {
                user_id: Number(user.user?.id),
                is_read: false,
            },
            data: {
                is_read: true,
            },
        });

        return { success: true, data: true };
        return { success: true, data: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Delete notification(s)
 */
const deleteNotification = async (notificationUuid: string): Promise<ActionResponse<boolean>> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) redirect("/signin");
        const notification = await prisma.notifications.findFirst({
            where: {
                notification_uuid: notificationUuid,
                user_id: Number(session.user?.id),
            },
        });
        if (!notification) return { success: false, error: "Notification not found" };
        if (!notification) return { success: false, error: "Notification not found" };
        await prisma.notifications.delete({
            where: {
                notification_id: notification.notification_id,
            },
        });
        return { success: true, data: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

export {
    getUserNotifications,
    getUserNotification,
    markNotificationAsRead,
    createNotification,
    markAllNotificationsAsRead,
    deleteNotification,
};
