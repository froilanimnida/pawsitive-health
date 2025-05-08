import React from "react";
import { Metadata } from "next";
import { getForumMetadata } from "@/actions";
import { NewPostForm } from "@/components/forum";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define metadata for the page
export const metadata: Metadata = {
    title: "Create New Post | Veterinary Forum | PawsitiveHealth",
    description: "Share your veterinary expertise by creating a new post in the PawsitiveHealth community forum.",
};

// New post creation page for veterinarians
export default async function VetNewPostPage() {
    // Get forum metadata (categories, tags)
    const metadataResponse = await getForumMetadata();

    // Get categories for the dropdown
    const categories = metadataResponse.success
        ? metadataResponse.data.categories
        : ["general", "question", "advice", "discussion"];

    return (
        <div className="container py-8 max-w-4xl">
            {/* Back button and breadcrumb */}
            <div className="mb-6">
                <Link
                    href="/vet/forum"
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Back to Forum</span>
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6">Share Your Expertise</h1>
            <p className="text-muted-foreground mb-6">
                As a veterinary professional, your insights are particularly valuable to our community. Share your
                knowledge, answer questions, or start discussions on pet health topics.
            </p>

            {/* New post form component */}
            <NewPostForm categories={categories} />
        </div>
    );
}
