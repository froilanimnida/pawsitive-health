import React from "react";
import { Metadata } from "next";
import { getForumMetadata, getForumPosts } from "@/actions";
import { ForumPostCard, ForumSidebar } from "@/components/forum";
import { Button, Pagination } from "@/components/ui";
import { Users, Stethoscope } from "lucide-react";
import Link from "next/link";
import { role_type } from "@prisma/client";

// Default page size for pagination
const PAGE_SIZE = 10;

// Metadata for the page
export const metadata: Metadata = {
    title: "Veterinary Community Forum | PawsitiveHealth",
    description:
        "Connect with other veterinarians and pet owners in our community forum to discuss pet health topics and provide expert advice.",
};

export default async function VetForumHome({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Await the searchParams promise
    const params = await searchParams;

    // Parse query parameters
    const page = params.page ? (typeof params.page === "string" ? parseInt(params.page) : parseInt(params.page[0])) : 1;

    const category =
        typeof params.category === "string"
            ? params.category
            : Array.isArray(params.category)
              ? params.category[0]
              : "";

    const tag = typeof params.tag === "string" ? params.tag : Array.isArray(params.tag) ? params.tag[0] : "";

    // Update all other references to searchParams to use params instead
    // ...rest of your component
    // Get forum data
    const [postsResponse, metadataResponse] = await Promise.all([
        getForumPosts({
            page,
            pageSize: PAGE_SIZE,
            category,
            tag,
        }),
        getForumMetadata(),
    ]);

    // Check if data fetching was successful
    const postsData = postsResponse.success ? postsResponse.data : { posts: [], totalPages: 1, totalPosts: 0 };
    const metadataData = metadataResponse.success ? metadataResponse.data : { categories: [], popularTags: [] };

    // Extract data for rendering
    const { posts, totalPages, totalPosts } = postsData;
    const { categories, popularTags } = metadataData;

    // Handle errors
    if (!postsResponse.success) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <h2 className="text-xl font-semibold mb-4">Failed to load forum posts</h2>
                <p className="text-muted-foreground mb-6">{postsResponse.error || "An unexpected error occurred"}</p>
                <Button asChild>
                    <Link href="/vet/forum">Try Again</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6 flex items-center">
                <Stethoscope className="mr-2 h-7 w-7" />
                Veterinary Community Forum
            </h1>
            <p className="text-muted-foreground mb-6">
                Welcome to the veterinary forum where you can share your expertise, answer questions, and connect with
                pet owners and other veterinarians.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Forum content - posts */}
                <div className="lg:col-span-3">
                    {/* Display post count and filter information */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold flex items-center">
                            <Users className="mr-2 h-5 w-5" />
                            {totalPosts} {totalPosts === 1 ? "Post" : "Posts"}
                            {category && (
                                <span className="ml-2 text-muted-foreground">
                                    in <span className="font-medium capitalize">{category}</span>
                                </span>
                            )}
                            {tag && (
                                <span className="ml-2 text-muted-foreground">
                                    tagged <span className="font-medium">{tag}</span>
                                </span>
                            )}
                        </h2>
                    </div>

                    {/* Display posts */}
                    {posts.length > 0 ? (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <ForumPostCard key={post.post_uuid} post={post} role={role_type.veterinarian} />
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav className="flex justify-center mt-8">
                                    <Pagination className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }).map((_, i) => {
                                            const pageNumber = i + 1;
                                            const isActive = pageNumber === page;
                                            const href = `/vet/forum?page=${pageNumber}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`;

                                            return (
                                                <Link
                                                    key={pageNumber}
                                                    href={href}
                                                    className={`flex items-center justify-center h-9 w-9 rounded-md ${
                                                        isActive
                                                            ? "bg-primary text-primary-foreground"
                                                            : "hover:bg-muted hover:text-accent-foreground"
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </Link>
                                            );
                                        })}
                                    </Pagination>
                                </nav>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center bg-muted/50 p-10 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {category || tag
                                    ? "Try removing filters or be the first to post in this category!"
                                    : "Be the first to start a discussion in our community!"}
                            </p>
                            <Button asChild>
                                <Link href="/vet/forum/new">Create New Post</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar with filters */}
                <div className="lg:col-span-1">
                    <ForumSidebar
                        role={role_type.veterinarian}
                        categories={categories}
                        popularTags={popularTags}
                        selectedCategory={category}
                        selectedTag={tag}
                    />
                </div>
            </div>
        </div>
    );
}
