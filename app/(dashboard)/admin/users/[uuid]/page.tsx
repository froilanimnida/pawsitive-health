import { notFound } from "next/navigation";
import { Suspense } from "react";
import UserDetailView from "@/components/admin/user-detail";
import { Skeleton, Card, CardContent, CardHeader } from "@/components/ui";
import type { UUIDPageParams } from "@/types";
import { getPets, getUser, petsCount } from "@/actions";

export const metadata = {
    title: "PawsitiveHealth | User Details",
    description: "User profile and management",
};

function UserDetailSkeleton() {
    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="skeleton h-16 w-16 rounded-full"></div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-[200px]" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-[200px]" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default async function AdminUserPage({ params }: UUIDPageParams) {
    const { uuid } = await params;
    const user = await getUser(uuid);
    if (!user.success) notFound();
    const petCount = await petsCount(user.data.user.user_id);
    const getPetsResponse = await getPets(user.data.user.user_id);
    const pets = getPetsResponse.success && getPetsResponse.data.pets ? getPetsResponse.data.pets : [];

    if (!uuid || !user.success) notFound();

    return (
        <section className="w-full px-4 py-6 space-y-8">
            <Suspense fallback={<UserDetailSkeleton />}>
                <UserDetailView petCount={petCount} pets={pets} user={user.data.user} />
            </Suspense>
        </section>
    );
}
