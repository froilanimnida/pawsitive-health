import { Suspense } from "react";
import { Metadata } from "next";
import { UsersList } from "@/components/admin/users-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = {
    title: "Admin Dashboard - User Management",
    description: "Manage users across the PawsitiveHealth platform",
};

// Skeleton loader for the users list
function UsersListSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Users</CardTitle>
                <CardDescription>Manage all users on the platform</CardDescription>
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 w-full bg-gray-200 animate-pulse rounded"></div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminUsersPage() {
    return (
        <section className="w-full px-4 py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            </div>

            <Suspense fallback={<UsersListSkeleton />}>
                <UsersList />
            </Suspense>
        </section>
    );
}
