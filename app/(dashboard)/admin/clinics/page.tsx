import { Suspense } from "react";
import { getClinics } from "@/actions";
import {
    SkeletonCard,
    Button,
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui";
import Link from "next/link";
import { MapPin, Phone, Building2, Eye } from "lucide-react";

const ClinicTable = async () => {
    const clinics = await getClinics();
    const clinicsData = clinics.success ? (clinics.data?.clinics ?? []) : [];

    if (!clinicsData || clinicsData.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No clinics found</h3>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableCaption>A list of all registered veterinary clinics</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px]">Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clinicsData.map((clinic) => (
                        <TableRow key={clinic.clinic_uuid}>
                            <TableCell className="font-medium">
                                <div className="flex items-center">
                                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {clinic.name}
                                </div>
                            </TableCell>
                            <TableCell>{clinic.city}</TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {clinic.address}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {clinic.phone_number}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" asChild>
                                    <Link href={`/admin/clinics/${clinic.clinic_uuid}`}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

const Clinics = () => {
    return (
        <section className="p-6 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Veterinary Clinics</h1>
            </div>
            <Suspense fallback={<SkeletonCard />}>
                <ClinicTable />
            </Suspense>
        </section>
    );
};

export default Clinics;
