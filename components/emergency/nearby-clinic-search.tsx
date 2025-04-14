"use client";

import { useEffect, useState } from "react";
import { getNearbyClinics } from "@/actions";
import { Badge, Button, Input } from "@/components/ui";
import { Search, MapPin, Phone, Clock } from "lucide-react";
import type { clinics } from "@prisma/client";
import { toast } from "sonner";

const NearbyClinicSearch = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [clinics, setClinics] = useState<clinics[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const getLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toast.error("Unable to get your location. Please check your browser permissions.");
                    setLoading(false);
                },
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    const searchClinics = async () => {
        if (!location) {
            toast.error("Please enable location services to find nearby clinics.");
            return;
        }

        setLoading(true);
        try {
            const result = await getNearbyClinics(location.latitude, location.longitude);
            if (result.success && result.data) {
                // Filter clinics with emergency services
                const clinicsData = result.data.clinics;
                setClinics(clinicsData);
                if (clinicsData.length === 0) {
                    toast.info("No emergency clinics found nearby. Try expanding your search area.");
                }
            } else {
                toast.error("Failed to fetch nearby clinics. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching clinics:", error);
            toast.error("An error occurred while searching for nearby clinics.");
        } finally {
            setLoading(false);
        }
    };

    // Filter clinics based on search query
    const filteredClinics = clinics.filter((clinic) => {
        const query = searchQuery.toLowerCase();
        return (
            clinic.name.toLowerCase().includes(query) ||
            clinic.address.toLowerCase().includes(query) ||
            clinic.city.toLowerCase().includes(query) ||
            clinic.state.toLowerCase().includes(query)
        );
    });

    // Sort clinics by emergency services first
    const sortedClinics = [...filteredClinics].sort((a, b) => {
        if (a.emergency_services && !b.emergency_services) return -1;
        if (!a.emergency_services && b.emergency_services) return 1;
        return 0;
    });

    // Trigger search when location changes
    useEffect(() => {
        if (location) {
            searchClinics();
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Button onClick={getLocation} disabled={loading} variant="outline" className="w-full md:w-auto">
                    <MapPin className="mr-2 h-4 w-4" />
                    {location ? "Update Location" : "Use My Location"}
                </Button>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter clinics by name or address..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Searching for nearby clinics...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedClinics.length > 0 ? (
                        sortedClinics.map((clinic) => (
                            <div
                                key={clinic.clinic_id}
                                className="border p-4 rounded-lg hover:border-primary transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{clinic.name}</h3>
                                        <p className="text-muted-foreground">
                                            {clinic.address}, {clinic.city}, {clinic.state} {clinic.postal_code}
                                        </p>
                                    </div>
                                    {clinic.emergency_services && (
                                        <Badge variant="destructive">Emergency Services</Badge>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                    <a
                                        href={`tel:${clinic.phone_number}`}
                                        className="flex items-center text-primary hover:underline"
                                    >
                                        <Phone className="mr-2 h-4 w-4" />
                                        {clinic.phone_number}
                                    </a>

                                    {clinic.google_maps_url && (
                                        <a
                                            href={clinic.google_maps_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-primary hover:underline"
                                        >
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Directions
                                        </a>
                                    )}

                                    {clinic.website && (
                                        <a
                                            href={clinic.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-primary hover:underline"
                                        >
                                            View Website
                                        </a>
                                    )}
                                </div>

                                <div className="mt-2 text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>Check clinic website or call for current emergency hours</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : location ? (
                        <div className="text-center py-8">
                            <p>No clinics found nearby. Try updating your location or expanding your search area.</p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p>Use the location button above to find clinics near you.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NearbyClinicSearch;
