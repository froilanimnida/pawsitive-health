import { Suspense } from "react";
import { Metadata } from "next";
import NearbyClinicSearch from "@/components/emergency/nearby-clinic-search";
import FirstAidArticles from "@/components/emergency/first-aid-articles";
import EmergencyContacts from "@/components/emergency/emergency-contacts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import MaxWidthContainer from "@/components/shared/layout/max-width-container";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Emergency Services",
    description: "Find nearby veterinary clinics, emergency care instructions and contacts for your pet.",
};

export default function EmergencyServicesPage() {
    return (
        <MaxWidthContainer>
            <div className="py-6">
                <h1 className="text-3xl font-bold text-center mb-6">Emergency Pet Services</h1>
                <p className="text-center mb-8 text-muted-foreground max-w-3xl mx-auto">
                    If your pet requires immediate attention, find nearby clinics, access first aid information, or
                    contact emergency services.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Nearby Clinics Search Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Find Nearby Emergency Clinics</CardTitle>
                            <CardDescription>
                                Search for veterinary clinics near your current location that offer emergency services
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                                <NearbyClinicSearch />
                            </Suspense>
                        </CardContent>
                    </Card>

                    {/* Emergency Contacts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contacts</CardTitle>
                            <CardDescription>Important contacts for pet emergencies</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                                <EmergencyContacts />
                            </Suspense>
                        </CardContent>
                    </Card>

                    {/* First Aid Information */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Pet First Aid Information</CardTitle>
                            <CardDescription>Critical first aid information for common pet emergencies</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                                <FirstAidArticles />
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MaxWidthContainer>
    );
}
