import type { Metadata } from "next";
import { Suspense } from "react";
import { UpcomingHealthcareDashboard } from "@/components/dashboard/upcoming-healthcare";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { getDashboardHealthcare } from "@/actions";

export const metadata: Metadata = {
    title: "PawsitiveHealth | User Dashboard",
    description: "User dashboard for PawsitiveHealth.",
};
// Skeleton loader for the dashboard components
function DashboardSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 animate-pulse">
            <Card>
                <CardHeader>
                    <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded-md"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded-md"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const UserDashboard = async () => {
    const response = await getDashboardHealthcare();

    const vaccinations = response.success ? response.data.vaccinations : [];
    const prescriptions = response.success ? response.data.prescriptions : [];
    return (
        <div className="w-full mx-auto py-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
                <p className="text-muted-foreground">Monitor your pet&apos;s health all in one place at a glance</p>
            </div>

            <Suspense fallback={<DashboardSkeleton />}>
                <UpcomingHealthcareDashboard prescriptions={prescriptions} vaccinations={vaccinations} />
            </Suspense>
        </div>
    );
};

export default UserDashboard;
