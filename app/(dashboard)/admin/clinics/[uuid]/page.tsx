import { getClinic } from "@/actions/clinic";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui";
import type { UUIDPageParams } from "@/types";
import { Building2, MapPin, Phone, Globe, Clock, Calendar, Users, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const ClinicDetails = async ({ params }: UUIDPageParams) => {
    const { uuid } = await params;
    const clinicResult = await getClinic(uuid);

    if (!clinicResult.success || !clinicResult.data) {
        notFound();
    }

    const {clinic} = clinicResult.data;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/clinics">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Clinics
                        </Link>
                    </Button>
                </div>
                <Button asChild>
                    <Link href={`/admin/clinics/${uuid}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Clinic
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Clinic Information */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle className="text-2xl">{clinic.name}</CardTitle>
                                <CardDescription>{clinic.city}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start space-x-2">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">Address</p>
                                <p className="text-muted-foreground">{clinic.address}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">Contact Number</p>
                                <p className="text-muted-foreground">{clinic.phone_number}</p>
                            </div>
                        </div>

                        {/*{clinic.email && (
                            <div className="flex items-start space-x-2">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-muted-foreground">{clinic.email}</p>
                                </div>
                            </div>
                        )}*/}

                        {clinic.website && (
                            <div className="flex items-start space-x-2">
                                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Website</p>
                                    <a
                                        href={clinic.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {clinic.website}
                                    </a>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clinic Overview</CardTitle>
                        <CardDescription>Quick statistics for this clinic</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <span>Veterinarians</span>
                            </div>
                            <span className="font-medium text-lg">{clinic.veterinarian_count || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span>Appointments</span>
                            </div>
                            <span className="font-medium text-lg">{clinic.appointment_count || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <span>Operating Since</span>
                            </div>
                            <span className="font-medium">
                                {clinic.created_at ? new Date(clinic.created_at).getFullYear() : "N/A"}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href={`/admin/clinics/${uuid}/schedules`}>View Clinic Schedules</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Additional Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Veterinarians Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Veterinarians</CardTitle>
                        <CardDescription>Veterinarians working at this clinic</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {clinic.veterinarians && clinic.veterinarians.length > 0 ? (
                            <ul className="space-y-2">
                                {clinic.veterinarians.map((vet) => (
                                    <li
                                        key={vet.id}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                                    >
                                        <span>{vet.name}</span>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/veterinarians/${vet.id}`}>View Profile</Link>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No veterinarians assigned to this clinic yet.</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href={`/admin/clinics/${uuid}/veterinarians`}>Manage Veterinarians</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Services Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Services</CardTitle>
                        <CardDescription>Services offered by this clinic</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {clinic.services && clinic.services.length > 0 ? (
                            <ul className="space-y-2">
                                {clinic.services.map((service) => (
                                    <li
                                        key={service.id}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                                    >
                                        <span>{service.name}</span>
                                        <span className="text-muted-foreground">{`$${service.price?.toFixed(2) || "Price varies"}`}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No services listed for this clinic yet.</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href={`/admin/clinics/${uuid}/services`}>Manage Services</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ClinicDetails;
