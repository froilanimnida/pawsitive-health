import type { UUIDPageParams } from "@/types";
import { getVeterinarian, getVeterinarianAppointments, getUser } from "@/actions";
import { getVeterinaryAvailability } from "@/actions/veterinarian-availability";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
    Avatar,
    AvatarFallback,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Badge,
    Button,
    Separator,
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui";
import { CalendarDays, Mail, Phone, Award, Clock, FileText, ChevronLeft, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { toTitleCase } from "@/lib";
import { format } from "date-fns";

// Cache the veterinarian data fetching to improve performance
const getVeterinarianDetails = cache(async (uuid: string) => {
    const veterinarian = await getVeterinarian(uuid);
    if (!veterinarian.success || !veterinarian.data?.veterinarian.user_id) return null;

    const user = await getUser(veterinarian.data.veterinarian.user_id);
    if (!user.success) return null;

    const availability = await getVeterinaryAvailability(veterinarian.data.veterinarian.vet_id);
    const appointments = await getVeterinarianAppointments();

    return {
        user: user.data.user,
        veterinarian: veterinarian.data.veterinarian,
        availability: availability.success ? availability.data.availability : [],
        appointments: appointments.success ? appointments.data.appointments : [],
    };
});

export const metadata = {
    title: "Veterinarian Details | Pawsitive Health",
    description: "View veterinarian details including profile, availability, and appointments",
};

async function VeterinaryInfo({ params }: UUIDPageParams) {
    const { uuid } = await params;
    if (!uuid) return notFound();

    const vetData = await getVeterinarianDetails(uuid);
    if (!vetData) return notFound();

    const { user, veterinarian, availability, appointments } = vetData;
    const fullName = `${user.first_name} ${user.last_name}`;
    const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

    const formattedSpecialization = toTitleCase(veterinarian.specialization.replace(/_/g, " "));

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const availabilityByDay = dayNames.map((dayName, index) => {
        const dayAvailability = availability.find((a) => a.day_of_week === index);
        if (!dayAvailability || !dayAvailability.is_available) {
            return { dayName, available: false };
        }

        const startTime = new Date(dayAvailability.start_time);
        const endTime = new Date(dayAvailability.end_time);
        const formattedStart = format(startTime, "h:mm a");
        const formattedEnd = format(endTime, "h:mm a");

        return {
            dayName,
            available: true,
            hours: `${formattedStart} - ${formattedEnd}`,
        };
    });

    // Group appointments
    const upcomingAppointments = appointments.filter(
        (app) => new Date(app.appointment_date) >= new Date() && app.status !== "cancelled",
    );
    const pastAppointments = appointments.filter(
        (app) => new Date(app.appointment_date) < new Date() || app.status === "cancelled",
    );

    return (
        <div className="w-full py-8 space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/clinic/vets">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Veterinarians
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <Card className="w-full">
                    <CardHeader className="flex flex-col items-center text-center">
                        <Avatar className="h-32 w-32">
                            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="mt-4 text-2xl">{fullName}</CardTitle>
                        <CardDescription>
                            <Badge variant="secondary" className="mt-1">
                                {formattedSpecialization}
                            </Badge>
                        </CardDescription>
                        <div className="flex flex-col gap-2 w-full mt-4">
                            <Link
                                href={`mailto:${user.email}`}
                                target="_blank"
                                className="flex items-center gap-2 hover:underline-offset-4 hover:underline"
                            >
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            </Link>
                            <Link
                                href={`tel:${user.phone_number}`}
                                className="flex items-center gap-2 hover:underline-offset-4 hover:underline"
                            >
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.phone_number || "No phone number"}</span>
                                </div>
                            </Link>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    Member since: {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2 flex items-center">
                                    <Award className="h-4 w-4 mr-2" /> Specialization
                                </h3>
                                <p>{formattedSpecialization}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Expertise in treating various animals with focus on{" "}
                                    {formattedSpecialization.toLowerCase()} medicine.
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-2 flex items-center">
                                    <FileText className="h-4 w-4 mr-2" /> Credentials
                                </h3>
                                <p>License Number: {veterinarian.license_number}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Certified and licensed veterinary practitioner
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <Tabs defaultValue="schedule" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="schedule">
                                <Clock className="h-4 w-4 mr-2" />
                                Schedule
                            </TabsTrigger>
                            <TabsTrigger value="appointments">
                                <Calendar className="h-4 w-4 mr-2" />
                                Appointments
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="schedule" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Working Hours</CardTitle>
                                    <CardDescription>Weekly schedule and availability</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {availabilityByDay.map((day) => (
                                            <div key={day.dayName} className="flex justify-between items-center">
                                                <div className="font-medium">{day.dayName}</div>
                                                <div className="flex items-center">
                                                    {day.available ? (
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                            <span>{day.hours}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Not Available</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="appointments" className="space-y-4 mt-6">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Upcoming Appointments</CardTitle>
                                        <CardDescription>Scheduled appointments for this veterinarian</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {upcomingAppointments.length === 0 ? (
                                            <div className="text-center py-6 text-muted-foreground">
                                                No upcoming appointments scheduled
                                            </div>
                                        ) : (
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableCaption>List of upcoming appointments</TableCaption>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Date & Time</TableHead>
                                                            <TableHead>Pet</TableHead>
                                                            <TableHead>Type</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead className="w-[100px]">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {upcomingAppointments.map((appointment) => {
                                                            const appointmentDate = new Date(
                                                                appointment.appointment_date,
                                                            );
                                                            return (
                                                                <TableRow key={appointment.appointment_id}>
                                                                    <TableCell className="font-medium">
                                                                        {format(appointmentDate, "MMM d, yyyy")}
                                                                        <br />
                                                                        <span className="text-muted-foreground text-sm">
                                                                            {format(appointmentDate, "h:mm a")}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {appointment.pets?.name || "N/A"}
                                                                        <br />
                                                                        <span className="text-muted-foreground text-sm">
                                                                            {appointment.pets?.species || ""}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {toTitleCase(
                                                                            appointment.appointment_type.replace(
                                                                                /_/g,
                                                                                " ",
                                                                            ),
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={
                                                                                appointment.status === "confirmed"
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : appointment.status === "requested"
                                                                                      ? "bg-blue-100 text-blue-800"
                                                                                      : "bg-amber-100 text-amber-800"
                                                                            }
                                                                        >
                                                                            {toTitleCase(
                                                                                appointment.status.replace(/_/g, " "),
                                                                            )}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button variant="ghost" size="sm" asChild>
                                                                            <Link
                                                                                href={`/vet/appointments/${appointment.appointment_uuid}`}
                                                                            >
                                                                                <Eye className="h-4 w-4 mr-1" /> View
                                                                            </Link>
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Past Appointments</CardTitle>
                                        <CardDescription>Previous appointments for this veterinarian</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {pastAppointments.length === 0 ? (
                                            <div className="text-center py-6 text-muted-foreground">
                                                No past appointments found
                                            </div>
                                        ) : (
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableCaption>List of past appointments</TableCaption>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Date & Time</TableHead>
                                                            <TableHead>Pet</TableHead>
                                                            <TableHead>Type</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead className="w-[100px]">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {pastAppointments.slice(0, 10).map((appointment) => {
                                                            const appointmentDate = new Date(
                                                                appointment.appointment_date,
                                                            );
                                                            return (
                                                                <TableRow key={appointment.appointment_id}>
                                                                    <TableCell className="font-medium">
                                                                        {format(appointmentDate, "MMM d, yyyy")}
                                                                        <br />
                                                                        <span className="text-muted-foreground text-sm">
                                                                            {format(appointmentDate, "h:mm a")}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {appointment.pets?.name || "N/A"}
                                                                        <br />
                                                                        <span className="text-muted-foreground text-sm">
                                                                            {appointment.pets?.species || ""}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {toTitleCase(
                                                                            appointment.appointment_type.replace(
                                                                                /_/g,
                                                                                " ",
                                                                            ),
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={
                                                                                appointment.status === "completed"
                                                                                    ? "bg-purple-100 text-purple-800"
                                                                                    : appointment.status === "cancelled"
                                                                                      ? "bg-red-100 text-red-800"
                                                                                      : "bg-gray-100 text-gray-800"
                                                                            }
                                                                        >
                                                                            {toTitleCase(
                                                                                appointment.status.replace(/_/g, " "),
                                                                            )}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button variant="ghost" size="sm" asChild>
                                                                            <Link
                                                                                href={`/vet/appointments/${appointment.appointment_uuid}`}
                                                                            >
                                                                                <Eye className="h-4 w-4 mr-1" /> View
                                                                            </Link>
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                    {pastAppointments.length > 10 && (
                                        <CardFooter>
                                            <Button variant="outline" className="w-full">
                                                View All Past Appointments
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default VeterinaryInfo;
