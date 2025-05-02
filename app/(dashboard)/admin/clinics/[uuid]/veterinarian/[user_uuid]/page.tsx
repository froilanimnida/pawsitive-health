import { getUser, getVeterinarian } from "@/actions";
import { cache } from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Separator,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import { CalendarDays, Mail, Phone, Award, Clock, FileText, Star } from "lucide-react";

const getVeterinarianDetails = cache(async (uuid: string) => {
    const veterinarian = await getVeterinarian(uuid);
    if (!veterinarian || !veterinarian.success || !veterinarian.data.veterinarian.user_id) return null;
    const user = await getUser(veterinarian.data.veterinarian.user_id);
    if (!veterinarian || !veterinarian.success || !user || !user.success) return null;
    return {
        user: user.data.user,
        veterinarian: veterinarian.data.veterinarian,
    };
});

export const metadata = {
    title: "Veterinarian Details | Pawsitive Health",
    description: "Veterinarian Details",
};

const VeterinarianDetails = async ({ params }: { params: { user_uuid: string } }) => {
    const { user_uuid } = await params;
    const data = await getVeterinarianDetails(user_uuid);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                <h2 className="text-2xl font-semibold mb-2">Veterinarian Not Found</h2>
                <p className="text-muted-foreground">The requested veterinarian profile could not be found.</p>
            </div>
        );
    }

    const { user, veterinarian } = data;
    const fullName = `${user.first_name} ${user.last_name}`;
    const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

    // Format specialization for display
    const formattedSpecialization = veterinarian.specialization
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Card */}
                <Card className="md:w-1/3">
                    <CardHeader className="flex flex-col items-center text-center">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={""} alt={fullName} />
                            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="mt-4 text-2xl">{fullName}</CardTitle>
                        <CardDescription>
                            <Badge variant="secondary" className="mt-1">
                                {formattedSpecialization}
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center">
                            <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">License #: {veterinarian.license_number}</span>
                        </div>
                        <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                        </div>
                        {user.phone_number && (
                            <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">{user.phone_number}</span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                                Member since: {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Edit Profile</Button>
                    </CardFooter>
                </Card>

                {/* Details Section */}
                <div className="flex-1">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="schedule">Schedule</TabsTrigger>
                            <TabsTrigger value="patients">Patients</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Skills & Expertise</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>Animal Diagnostics</Badge>
                                        <Badge>Surgical Procedures</Badge>
                                        <Badge>Pet Healthcare</Badge>
                                        <Badge>Laboratory Analysis</Badge>
                                        <Badge>Preventive Care</Badge>
                                        <Badge>{formattedSpecialization}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schedule" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Working Hours</CardTitle>
                                    <CardDescription>Weekly schedule and availability</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                                            <div key={day} className="flex justify-between items-center">
                                                <div className="font-medium">{day}</div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <span>9:00 AM - 5:00 PM</span>
                                                </div>
                                            </div>
                                        ))}
                                        {["Saturday", "Sunday"].map((day) => (
                                            <div
                                                key={day}
                                                className="flex justify-between items-center text-muted-foreground"
                                            >
                                                <div className="font-medium">{day}</div>
                                                <div>Off</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="patients" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Patient Statistics</CardTitle>
                                    <CardDescription>Patients under care</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-center">
                                                    <div className="text-4xl font-bold">27</div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Active Patients
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-center">
                                                    <div className="text-4xl font-bold">12</div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Appointments This Week
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-4xl font-bold ml-1">4.9</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Patient Rating</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default VeterinarianDetails;
