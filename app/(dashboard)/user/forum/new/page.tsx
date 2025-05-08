import React from "react";
import { Metadata } from "next";
import { getForumMetadata } from "@/actions";
import { NewPostForm } from "@/components/forum";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define metadata for the page
export const metadata: Metadata = {
    title: "Create New Post | Forum | PawsitiveHealth",
    description: "Create a new post in the PawsitiveHealth community forum to share your experience or ask a question.",
};

// New post creation page
export default async function NewPostPage() {
    // Get forum metadata (categories, tags)
    const metadataResponse = await getForumMetadata();

    // Get categories for the dropdown
    const categories = metadataResponse.success
        ? metadataResponse.data.categories
        : ["general", "question", "discussion"];

    return (
        <div className="container py-8 max-w-4xl">
            {/* Back button and breadcrumb */}
            <div className="mb-6">
                <Link
                    href="/user/forum"
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Back to Forum</span>
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>

            {/* New post form component */}
            <NewPostForm categories={categories} />
        </div>
    );
}
