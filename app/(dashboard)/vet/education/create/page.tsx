import { getEducationalContentCategories } from "@/actions/educational-content";
import { EducationalContentForm } from "@/components/education/educational-content-form";
import { VetEducationNav } from "@/components/education/vet-education-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib";

export const metadata: Metadata = {
    title: "Create Educational Content | PawsitiveHealth",
    description: "Create educational content for pet owners",
};

export default async function CreateEducationalContentPage() {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect("/signin");
    }

    // Role check - only veterinarians can create content
    const user = await prisma.users.findUnique({
        where: { user_id: Number(session.user.id) },
        select: { role: true },
    });

    if (!user || user.role !== "veterinarian") {
        redirect("/not-found");
    }

    const categoriesResponse = await getEducationalContentCategories();

    // Default categories if none exist yet in the database
    const defaultCategories = [
        "Nutrition",
        "Preventative Care",
        "Common Diseases",
        "Behavior",
        "Training",
        "Dental Health",
        "Pet Safety",
        "Emergency Care",
        "Senior Pet Care",
        "Puppy & Kitten Care",
    ];

    const categories =
        categoriesResponse.success && categoriesResponse.data.categories.length > 0
            ? categoriesResponse.data.categories
            : defaultCategories;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Educational Content</h1>

            {/* Navigation Pills */}
            <VetEducationNav />

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Content</CardTitle>
                    <CardDescription>
                        Share your veterinary expertise with pet owners by creating educational content
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EducationalContentForm categories={categories} />
                </CardContent>
            </Card>
        </div>
    );
}
