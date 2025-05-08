"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Textarea,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Badge,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui";
import { ForumPostSchema, type ForumPostType } from "@/schemas";
import { createForumPost } from "@/actions";
import { toast } from "sonner";
import { X } from "lucide-react";
import { post_category } from "@prisma/client";

interface NewPostFormProps {
    categories: string[];
}

export function NewPostForm({ categories }: NewPostFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const form = useForm<ForumPostType>({
        resolver: zodResolver(ForumPostSchema),
        defaultValues: {
            title: "",
            content: "",
            category: post_category.general,
            tags: [],
        },
    });

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            const newTags = [...tags, tagInput.trim()];
            setTags(newTags);
            form.setValue("tags", newTags);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove);
        setTags(newTags);
        form.setValue("tags", newTags);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        }
    };

    const onSubmit = async (values: ForumPostType) => {
        setIsSubmitting(true);
        try {
            // Add current tags to form data
            values.tags = tags;

            const result = await createForumPost(values);

            if (result.success) {
                toast.success("Post created successfully");
            } else {
                toast.error(result.error || "Failed to create post");
            }
        } catch (error) {
            console.error("Error creating post:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Post title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.length > 0 ? (
                                                categories.map((category, index) => (
                                                    <SelectItem key={index} value={category}>
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="general">General</SelectItem>
                                            )}
                                            {/* Always provide a default category */}
                                            {!categories.includes("general") && (
                                                <SelectItem value="general">General</SelectItem>
                                            )}
                                            {!categories.includes("question") && (
                                                <SelectItem value="question">Question</SelectItem>
                                            )}
                                            {!categories.includes("discussion") && (
                                                <SelectItem value="discussion">Discussion</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your post here..."
                                            className="min-h-[200px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormLabel>Tags</FormLabel>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add tags (press Enter or , to add)"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" onClick={addTag}>
                                    Add
                                </Button>
                            </div>

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="pl-2">
                                            {tag}
                                            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <CardFooter className="px-0">
                            <div className="flex gap-2 justify-end w-full">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Post"}
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
