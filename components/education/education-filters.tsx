"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button, Card, CardTitle, CardContent, CardDescription, Badge } from "@/components/ui";
import { Search, X } from "lucide-react";
import { debounce } from "lodash";

interface EducationFiltersProps {
    categories: string[];
    popularTags: string[];
    selectedCategory?: string;
    selectedTags?: string[];
    searchQuery?: string;
}

export function EducationFilters({
    categories,
    popularTags,
    selectedCategory,
    selectedTags = [],
    searchQuery = "",
}: EducationFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(searchQuery);

    // Create a queryString builder
    const createQueryString = useCallback(
        (params: Record<string, string | string[] | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());

            // Update or remove each parameter
            Object.entries(params).forEach(([name, value]) => {
                if (value === null) {
                    newParams.delete(name);
                } else if (Array.isArray(value)) {
                    newParams.delete(name); // Remove old values
                    value.forEach((val) => {
                        newParams.append(name, val);
                    });
                } else {
                    newParams.set(name, value);
                }
            });

            return newParams.toString();
        },
        [searchParams],
    );

    // Handle search with debounce
    const handleSearch = debounce((term: string) => {
        startTransition(() => {
            const query =
                term.trim() === ""
                    ? createQueryString({ search: null, page: "1" })
                    : createQueryString({ search: term, page: "1" });

            router.push(`/education?${query}`);
        });
    }, 400);

    // Handle category selection
    const handleCategoryChange = (category: string) => {
        startTransition(() => {
            const query =
                category === selectedCategory
                    ? createQueryString({ category: null, page: "1" })
                    : createQueryString({ category, page: "1" });

            router.push(`/education?${query}`);
        });
    };

    // Handle tag selection
    const handleTagChange = (tag: string) => {
        startTransition(() => {
            const currentTags = [...selectedTags];
            const tagIndex = currentTags.indexOf(tag);

            if (tagIndex >= 0) {
                // Remove tag if already selected
                currentTags.splice(tagIndex, 1);
            } else {
                // Add tag if not selected
                currentTags.push(tag);
            }

            const query = createQueryString({
                tags: currentTags.length > 0 ? currentTags : null,
                page: "1",
            });

            router.push(`/education?${query}`);
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        startTransition(() => {
            router.push("/education");
            setSearch("");
        });
    };

    return (
        <div className="space-y-6">
            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search articles..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
            </div>

            {/* Categories filter */}
            <Card>
                <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2">Categories</CardTitle>
                    <div className="space-y-1 mt-3">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => handleCategoryChange(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Popular tags */}
            <Card>
                <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2">Popular Tags</CardTitle>
                    <CardDescription className="text-sm mb-3">Filter content by specific topics</CardDescription>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                            <Badge
                                key={tag}
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleTagChange(tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Clear filters */}
            {(selectedCategory || selectedTags.length > 0 || search) && (
                <Button variant="outline" className="w-full" onClick={clearAllFilters} disabled={isPending}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
