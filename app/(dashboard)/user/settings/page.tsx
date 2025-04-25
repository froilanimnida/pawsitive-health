import { Suspense } from "react";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Separator, Skeleton } from "@/components/ui";
import { User, Paintbrush, CalendarIcon, Lock } from "lucide-react";
import ProfileForm from "@/components/form/profile-form";
import AppearanceForm from "@/components/form/appearance-form";
import CalendarIntegrationForm from "@/components/form/calendar-integration-form";
import PasswordChangeForm from "@/components/form/password-change-form";
import { getUserPreference } from "@/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import type { user_settings } from "@prisma/client";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Settings",
    description: "Manage your account settings and preferences",
};

function SkeletonCard() {
    return (
        <Card className="mb-6">
            <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-3/4" />
                </div>
            </CardContent>
        </Card>
    );
}

function SettingsContent({ preference }: { preference: user_settings }) {
    return (
        <div className="space-y-8 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <div className="grid gap-1">
                        <CardTitle>
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Profile Information</span>
                            </div>
                        </CardTitle>
                        <CardDescription>Manage your account details and contact information</CardDescription>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <ProfileForm />
                </CardContent>
            </Card>

            {/* Password Security */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <div className="grid gap-1">
                        <CardTitle>
                            <div className="flex items-center space-x-2">
                                <Lock className="h-5 w-5" />
                                <span>Password Security</span>
                            </div>
                        </CardTitle>
                        <CardDescription>Update your password and secure your account</CardDescription>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <PasswordChangeForm />
                </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <div className="grid gap-1">
                        <CardTitle>
                            <div className="flex items-center space-x-2">
                                <Paintbrush className="h-5 w-5" />
                                <span>Appearance</span>
                            </div>
                        </CardTitle>
                        <CardDescription>Customize the application&apos;s look and feel</CardDescription>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <AppearanceForm theme_mode={preference.theme_mode} user_id={preference.user_id.toString()} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <div className="grid gap-1">
                        <CardTitle>
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-5 w-5" />
                                <span>Calendar Integration</span>
                            </div>
                        </CardTitle>
                        <CardDescription>Connect your Google Calendar to sync appointments</CardDescription>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <CalendarIntegrationForm
                        connected={preference.google_calendar_sync}
                        userId={preference.user_id.toString()}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export default async function Settings() {
    const session = await getServerSession(authOptions);
    if (!session) {
        notFound();
    }
    const userSettings = await getUserPreference(Number(session?.user?.id));
    if (!userSettings || !userSettings.success) {
        notFound();
    }
    return (
        <section className="mx-auto py-8 w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>
            </div>

            <Suspense
                fallback={
                    <div className="space-y-8">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                }
            >
                <SettingsContent preference={userSettings.data.user_settings} />
            </Suspense>
        </section>
    );
}
