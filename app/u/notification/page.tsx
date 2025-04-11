import { Suspense } from "react";
import NotificationsContent from "@/components/shared/notification-content";
import { Skeleton } from "@/components/ui";

export default function NotificationsPage() {
    return (
        <Suspense fallback={<NotificationsLoadingFallback />}>
            <NotificationsContent />
        </Suspense>
    );
}

function NotificationsLoadingFallback() {
    return (
        <div className="py-8 w-full">
            <div className="mb-8">
                <Skeleton className="h-10 w-full max-w-md mb-4" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={`skeleton-${index}`} className="w-full h-32" />
                ))}
            </div>
        </div>
    );
}
