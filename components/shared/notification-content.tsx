"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getUserNotifications } from "@/actions";
import { NotificationFilters } from "@/components/shared/notification-filters";
import { NotificationCard } from "@/components/shared/notification-card";
import { Button, Skeleton } from "@/components/ui";
import { Loader2 } from "lucide-react";
import type { notification_type, notifications } from "@prisma/client";

export default function NotificationsContent() {
    const [notifications, setNotifications] = useState<notifications[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const searchParams = useSearchParams();

    const typeFilter = searchParams.get("type") as notification_type | null;
    const statusFilter = searchParams.get("status") || "all";

    const getIsReadValue = (status: string) => {
        if (status === "read") return true;
        if (status === "unread") return false;
        return undefined; // "all" case
    };

    const fetchNotifications = useCallback(
        async (pageNum: number, refresh = false) => {
            try {
                setIsLoading(true);
                const isRead = getIsReadValue(statusFilter);

                const response = await getUserNotifications({
                    page: pageNum,
                    pageSize: 10,
                    type: typeFilter || undefined,
                    isRead,
                });

                if (!response.success || !response.data) {
                    throw new Error((!response.success && response.error) || "Failed to load notifications");
                }

                const { notifications: fetchedNotifications, totalCount, hasMore } = response.data;

                // If refresh, replace all notifications, otherwise append
                setNotifications((prevNotifications) =>
                    refresh ? fetchedNotifications : [...prevNotifications, ...fetchedNotifications],
                );
                setTotalCount(totalCount);
                setHasMore(hasMore);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        },
        [typeFilter, statusFilter],
    );

    // Load more notifications
    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchNotifications(nextPage);
        }
    }, [hasMore, isLoading, page, fetchNotifications]);

    // Reset and refresh when filters change
    useEffect(() => {
        // Reset pagination state
        setPage(1);
        setNotifications([]);

        // Mark as initial load to prevent unnecessary fetches
        setIsInitialLoad(true);

        // Fetch the first page of notifications with new filters
        fetchNotifications(1, true).then(() => {
            setIsInitialLoad(false);
        });
    }, [fetchNotifications, typeFilter, statusFilter]);

    useEffect(() => {
        if (isInitialLoad || isLoading || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.5 },
        );

        const loadMoreTrigger = document.getElementById("load-more-trigger");
        if (loadMoreTrigger) {
            observer.observe(loadMoreTrigger);
        }

        return () => {
            if (loadMoreTrigger) {
                observer.unobserve(loadMoreTrigger);
            }
            observer.disconnect();
        };
    }, [isLoading, hasMore, loadMore, isInitialLoad]);

    return (
        <div className="py-8 w-full">
            <NotificationFilters totalCount={totalCount} />

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
                    <p>{error}</p>
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                            setError(null);
                            setPage(1);
                            fetchNotifications(1, true);
                        }}
                    >
                        Try again
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                {notifications.length === 0 && !isLoading ? (
                    <div className="bg-muted p-8 rounded-md text-center">
                        <h3 className="font-medium text-lg mb-2">No notifications found</h3>
                        <p className="text-muted-foreground">
                            {typeFilter ? "Try changing your filter settings" : "You don't have any notifications yet"}
                        </p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <NotificationCard key={notification.notification_id} notification={notification} />
                        ))}
                    </>
                )}

                {/* Loading skeletons for first page load */}
                {isLoading &&
                    page === 1 &&
                    Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={`skeleton-${index}`} className="w-full h-32 mb-4" />
                    ))}

                {/* Loading indicator for additional pages */}
                {isLoading && page > 1 && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* Invisible element to trigger infinite loading */}
                {hasMore && !isLoading && <div id="load-more-trigger" className="h-1" />}

                {/* Manual load more button as fallback */}
                {hasMore && !isLoading && (
                    <div className="flex justify-center mt-4">
                        <Button variant="outline" onClick={loadMore}>
                            Load more
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
