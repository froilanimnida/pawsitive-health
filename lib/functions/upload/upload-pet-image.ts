import { uploadFileToR2 } from "@/lib/r2-service";
import type { FileUploadResult } from "@/types/file-upload-result-types";

/**
 * Uploads a pet profile image to R2 storage
 * @param file The image file to upload
 * @returns Promise with file upload result containing URL
 */
export async function uploadPetImage(file: File): Promise<FileUploadResult> {
    try {
        // Get file details
        const filename = file.name;
        const contentType = file.type;

        // Upload to the 'pets' folder in R2 storage
        const uploadResult = await uploadFileToR2(file, filename, contentType, "pets");

        return uploadResult;
    } catch (error) {
        console.error("Error uploading pet image:", error);
        throw new Error("Failed to upload pet image");
    }
}
