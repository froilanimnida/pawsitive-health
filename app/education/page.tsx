import { Metadata } from "next";
import { getEducationalContent } from "@/actions";
import { EducationContentList } from "@/components/education/education-content-list";
import { EducationFilters } from "@/components/education/education-filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = {
    title: "Educational Content | PawsitiveHealth",
    description: "Browse our educational content to learn more about pet health",
};

export default async function EducationPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;

    // Extract search parameters
    const category = typeof params.category === "string" ? params.category : undefined;
    const search = typeof params.search === "string" ? params.search : undefined;
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;

    // Handle tags (could be string or array)
    let tags: string[] | undefined;
    if (params.tags) {
        tags = Array.isArray(params.tags) ? params.tags : [params.tags];
    }

    // Fetch content with filters
    const contentResponse = await getEducationalContent({ category, tags, search }, page, 12);

    const content = contentResponse.success ? contentResponse.data.content : [];
    const totalCount = contentResponse.success ? contentResponse.data.totalCount : 0;
    const categories = contentResponse.success ? contentResponse.data.categories : [];
    const popularTags = contentResponse.success ? contentResponse.data.popularTags : [];

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Pet Health Education</CardTitle>
                        <CardDescription>
                            Browse our collection of educational articles about pet health, behavior, and care
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Filters sidebar */}
                            <div className="md:col-span-1">
                                <EducationFilters
                                    categories={categories}
                                    popularTags={popularTags}
                                    selectedCategory={category}
                                    selectedTags={tags}
                                    searchQuery={search}
                                />
                            </div>

                            {/* Content list */}
                            <div className="md:col-span-3">
                                <EducationContentList
                                    content={content}
                                    totalCount={totalCount}
                                    currentPage={page}
                                    pageSize={12}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
