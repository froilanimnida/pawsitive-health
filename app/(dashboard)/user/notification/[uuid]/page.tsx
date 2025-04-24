import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserNotification } from "@/actions";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Skeleton,
    Badge,
    Separator,
} from "@/components/ui";
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    ChevronLeft,
    Clock,
    ExternalLink,
    MessageCircle,
    Stethoscope,
} from "lucide-react";
import type { notification_priority } from "@prisma/client";
import type { UUIDPageParams } from "@/types";
import { getNotificationColor, getNotificationIcon } from "@/lib";

// Helper function to get priority badge variant
function getPriorityBadge(priority: notification_priority) {
    switch (priority) {
        case "urgent":
            return { variant: "destructive", icon: AlertCircle };
        case "high":
            return { variant: "destructive", icon: AlertTriangle };
        case "low":
            return { variant: "outline" };
        default:
            return { variant: "secondary" };
    }
}

// Helper function to format notification type
function formatNotificationType(type: string): string {
    return type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Loading component
function NotificationSkeleton() {
    return (
        <div className="container py-8 max-w-xl">
            <div className="flex items-center gap-2 mb-6">
                <ChevronLeft className="h-4 w-4" />
                <span>Back to notifications</span>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
    );
}

const NotificationDetail = async ({ uuid }: { uuid: string }) => {
    if (!uuid) notFound();
    const notification = await getUserNotification(uuid);

    if (!notification.success || !notification.data) notFound();

    const notificationData = notification.data;
    const Icon = getNotificationIcon(notificationData.type);
    const colorClass = getNotificationColor(notificationData.type);
    const notificationDate = notificationData.created_at
        ? format(new Date(notificationData.created_at), "PPpp")
        : "Unknown date";

    // Check if there's an expiration
    const hasExpiration = notificationData.expires_at !== null;
    const isExpired = hasExpiration && new Date(notificationData.expires_at!) < new Date();

    const priorityBadge = getPriorityBadge(notificationData.priority);

    let actionButton = null;

    if (notificationData.action_url) {
        actionButton = (
            <Button className="gap-2" size="sm" asChild>
                <Link href={notificationData.action_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Take Action
                </Link>
            </Button>
        );
    } else {
        // Generate action links based on relationships
        if (notificationData.appointment_id) {
            actionButton = (
                <Button className="gap-2" size="sm" asChild>
                    <Link href={`/user/appointments/${notificationData.appointments?.appointment_uuid || ""}`}>
                        <Calendar className="h-4 w-4" />
                        View Appointment
                    </Link>
                </Button>
            );
        } else if (notificationData.pet_id) {
            actionButton = (
                <Button className="gap-2" size="sm" asChild>
                    <Link href={`/user/pets/${notificationData.pets?.pet_uuid || ""}`}>
                        <Stethoscope className="h-4 w-4" />
                        View Pet
                    </Link>
                </Button>
            );
        } else if (notificationData.forum_post_id) {
            actionButton = (
                <Button className="gap-2" size="sm" asChild>
                    <Link href={`/post/${notificationData.forum_posts?.post_uuid || ""}`}>
                        <MessageCircle className="h-4 w-4" />
                        View Post
                    </Link>
                </Button>
            );
        }
    }

    return (
        <div className="container py-8 max-w-2xl">
            <Link
                href="/user/notification"
                className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-primary"
            >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to notifications</span>
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${colorClass}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {notificationData.title}
                                    {notificationData.priority !== "normal" && (
                                        <Badge
                                            variant={
                                                priorityBadge.variant as
                                                    | "default"
                                                    | "destructive"
                                                    | "outline"
                                                    | "secondary"
                                                    | null
                                                    | undefined
                                            }
                                        >
                                            {priorityBadge.icon && <priorityBadge.icon className="h-3 w-3 mr-1" />}
                                            {notificationData.priority.charAt(0).toUpperCase() +
                                                notificationData.priority.slice(1)}
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {notificationDate}
                                    </span>
                                    {hasExpiration && (
                                        <Badge variant={isExpired ? "outline" : "secondary"} className="text-xs">
                                            {isExpired
                                                ? "Expired"
                                                : `Expires: ${format(new Date(notificationData.expires_at!), "PP")}`}
                                        </Badge>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline">{formatNotificationType(notificationData.type)}</Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="prose dark:prose-invert max-w-none">
                        <p>{notificationData.content}</p>
                    </div>

                    {notificationData.pets && (
                        <>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={notificationData.pets.profile_picture_url || undefined} />
                                    <AvatarFallback>
                                        {notificationData.pets.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-medium">{notificationData.pets.name}</h4>
                                    <p className="text-sm text-muted-foreground">Related to this pet</p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2">{actionButton}</CardFooter>
            </Card>
        </div>
    );
};
export default async function NotificationDetailPage({ params }: UUIDPageParams) {
    const { uuid } = await params;
    return (
        <Suspense fallback={<NotificationSkeleton />}>
            <NotificationDetail uuid={uuid} />
        </Suspense>
    );
}
