"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Badge } from "@/components/ui";
import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import type { educational_content } from "@prisma/client";

interface EducationContentListProps {
    content: Array<educational_content>;
    totalCount: number;
    currentPage: number;
    pageSize: number;
}

export function EducationContentList({ content, totalCount, currentPage, pageSize }: EducationContentListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Total number of pages
    const totalPages = Math.ceil(totalCount / pageSize);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams],
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        const query = createQueryString("page", page.toString());
        router.push(`/education?${query}`);
    };

    if (content.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                    Try adjusting your filters or search to find what you&apos;re looking for.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.map((item) => (
                    <Link href={`/education/${item.content_uuid}`} key={item.content_uuid} className="group">
                        <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    <time dateTime={item.published_at.toISOString()}>
                                        {format(new Date(item.published_at), "MMMM d, yyyy")}
                                    </time>
                                </div>
                                <CardTitle className="group-hover:text-primary transition-colors">
                                    {item.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-sm">
                                    {item.content.substring(0, 120)}...
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pb-3">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">{item.category}</Badge>
                                    {item.tags.slice(0, 2).map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {item.tags.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{item.tags.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter>
                                {/*<div className="text-sm text-muted-foreground">
                                    By{" "}
                                    {item.author_id ? `${item.users.first_name} ${item.users.last_name}` : "Unknown Author"}
                                </div>*/}
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous</span>
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
