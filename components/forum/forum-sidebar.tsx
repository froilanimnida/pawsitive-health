"use client";
import { Card, CardContent, CardHeader, CardTitle, Input, Badge } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useTransition } from "react";
import { Search, Tag } from "lucide-react";
import Link from "next/link";
import { role_type } from "@prisma/client";

interface ForumSidebarProps {
    role: role_type;
    categories: string[];
    popularTags: string[];
    selectedCategory?: string;
    selectedTag?: string;
}

export function ForumSidebar({ categories, popularTags, selectedCategory, selectedTag, role }: ForumSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");

    // Helper to create URL search params
    const createQueryString = (name: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null) {
            params.delete(name);
        } else {
            params.set(name, value);
        }
        return params.toString();
    };

    // Handle search input
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            startTransition(() => {
                router.push(`/user/forum?${createQueryString("search", searchQuery)}`);
            });
        }
    };

    // Handle category selection
    const handleCategoryClick = (category: string) => {
        startTransition(() => {
            const query =
                category === selectedCategory
                    ? createQueryString("category", null)
                    : createQueryString("category", category);
            router.push(`/user/forum?${query}`);
        });
    };

    // Handle tag selection
    const handleTagClick = (tag: string) => {
        startTransition(() => {
            const query = tag === selectedTag ? createQueryString("tag", null) : createQueryString("tag", tag);
            router.push(`/user/forum?${query}`);
        });
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search posts..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-1.5">
                    {categories?.length > 0 ? (
                        categories.map((category, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-md cursor-pointer ${
                                    selectedCategory === category
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }`}
                                onClick={() => handleCategoryClick(category)}
                            >
                                <span className="capitalize">{category}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No categories available</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {popularTags?.length > 0 ? (
                            popularTags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant={selectedTag === tag ? "default" : "secondary"}
                                    className="cursor-pointer flex items-center"
                                    onClick={() => handleTagClick(tag)}
                                >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No tags available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link
                        href={role === role_type.user ? "/user/forum/new" : "/vet/forum/new"}
                        className="block w-full text-center bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90"
                    >
                        Create New Post
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
