import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { prisma } from "@/lib";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import { VetEducationNav } from "@/components/education/vet-education-nav";

export const metadata: Metadata = {
    title: "Manage Educational Content | PawsitiveHealth",
    description: "Create and manage educational content for pet owners",
};

export default async function VetEducationPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        redirect("/signin");
    }

    // Check if user is a veterinarian
    const user = await prisma.users.findUnique({
        where: { user_id: Number(session.user.id) },
        select: { role: true },
    });

    if (!user || user.role !== "veterinarian") {
        redirect("/not-found");
    }

    // Fetch content created by this veterinarian
    const contentResponse = await prisma.educational_content.findMany({
        where: {
            author_id: Number(session.user.id),
        },
        orderBy: {
            published_at: "desc",
        },
        include: {
            users: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
        },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Educational Content</h1>

            {/* Navigation Pills */}
            <VetEducationNav />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">My Educational Content</CardTitle>
                        <CardDescription>Manage articles you&apos;ve published to educate pet owners</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/vet/education/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Content
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {contentResponse.length > 0 ? (
                        <div className="space-y-6">
                            <div className="grid gap-6">
                                {contentResponse.map((content) => (
                                    <Card key={content.content_uuid} className="overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-medium">
                                                        <Link
                                                            href={`/education/${content.content_uuid}`}
                                                            className="hover:underline"
                                                        >
                                                            {content.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Published: {new Date(content.published_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/education/${content.content_uuid}`}>View</Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/vet/education/edit/${content.content_uuid}`}>
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="text-sm text-muted-foreground">
                                                    {content.content.length > 150
                                                        ? `${content.content.substring(0, 150)}...`
                                                        : content.content}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-4">
                                                <div className="bg-muted px-2 py-1 rounded-md text-xs">
                                                    {content.category}
                                                </div>
                                                {content.tags.slice(0, 3).map((tag) => (
                                                    <div key={tag} className="bg-muted/50 px-2 py-1 rounded-md text-xs">
                                                        {tag}
                                                    </div>
                                                ))}
                                                {content.tags.length > 3 && (
                                                    <div className="bg-muted/50 px-2 py-1 rounded-md text-xs">
                                                        +{content.tags.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-medium mb-2">No educational content yet</h3>
                            <p className="text-muted-foreground mb-6">
                                Share your veterinary expertise by creating educational content for pet owners
                            </p>
                            <Button asChild>
                                <Link href="/vet/education/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Article
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
