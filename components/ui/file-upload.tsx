"use client";
import { useState, useRef } from "react";
import { Button } from "./button";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onFileChange: (file: File | null) => void;
    currentImageUrl?: string | null;
    className?: string;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
}

export function FileUpload({
    onFileChange,
    currentImageUrl = null,
    className,
    label = "Upload file",
    accept = "image/*",
    maxSizeMB = 5,
}: FileUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setError(null);

        if (!file) {
            return;
        }

        // Validate file size (MB)
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Only image files are allowed");
            return;
        }

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Pass the file to parent component
        onFileChange(file);

        // Reset input value to ensure onChange triggers even if the same file is selected
        e.target.value = "";
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <input type="file" className="hidden" accept={accept} ref={fileInputRef} onChange={handleFileChange} />

            {previewUrl ? (
                <div className="relative w-full h-40 mb-2">
                    <Image src={previewUrl} alt="File preview" fill className="object-cover rounded-md" />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemove}
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    className="border-2 border-dashed rounded-md p-6 w-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
                    onClick={handleClick}
                >
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {!previewUrl && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClick}
                    className="w-full flex items-center gap-2"
                >
                    <UploadCloud className="h-4 w-4" />
                    <span>Browse</span>
                </Button>
            )}
        </div>
    );
}
