import type { FileUploadResult } from "@/types/file-upload-result-types";

/**
 * Uploads a pet profile image to R2 storage via the API route
 * @param file The image file to upload
 * @returns Promise with file upload result containing URL and key
 */
export async function uploadPetImage(file: File): Promise<FileUploadResult> {
    try {
        // Create a FormData object and append the file
        const formData = new FormData();
        formData.append("file", file);

        // Send the formData to the API route
        const response = await fetch("/api/upload/pet-image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to upload pet image");
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Error uploading pet image:", error);
        throw new Error("Failed to upload pet image");
    }
}
