import { getEducationalContentByUuid } from "@/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "@/components/ui";
import { ChevronLeft, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function EducationDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;
    const response = await getEducationalContentByUuid(uuid);

    if (!response.success) {
        notFound();
    }

    const { content } = response.data;
    //const authorName = content.users ? `${content.users.first_name} ${content.users.last_name}` : "Unknown Author";

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/education" className="inline-flex gap-2 items-center mb-6">
                <ChevronLeft className="size-4" />
                Back to Education
            </Link>

            <Card className="overflow-hidden">
                <CardHeader className="border-b pb-6">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <CardTitle className="text-3xl">{content.title}</CardTitle>
                            <CardDescription className="mt-2 flex flex-wrap items-center gap-4">
                                {/*<span className="inline-flex items-center gap-1">
                                    <User className="size-4" />
                                    {authorName}
                                </span>*/}
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="size-4" />
                                    {formatDistanceToNow(new Date(content.published_at), { addSuffix: true })}
                                </span>
                                <Badge variant="outline">{content.category}</Badge>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="prose max-w-none dark:prose-invert text-justify indent-16">
                        {/* For a real application, this would ideally be rich text or markdown */}
                        {content.content.split("\n").map((paragraph: string, index: number) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-2">
                        {content.tags.map((tag: string) => (
                            <Link href={`/education?tags=${encodeURIComponent(tag)}`} key={tag}>
                                <Badge variant="secondary" className="cursor-pointer">
                                    {tag}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
