import { updatePetProfileImage as updatePetProfileImageAction } from "@/actions/pets";
import { uploadPetImage } from "./upload-pet-image";
import type { ActionResponse } from "@/types";

/**
 * Comprehensive function for managing pet profile images
 * - Uploads image to R2 storage (if image provided)
 * - Updates pet database record with image URL and key
 * - Handles image removal (if null is provided)
 *
 * @param petId The ID of the pet to update
 * @param imageFile The image file to upload (or null to remove image)
 * @returns Promise with ActionResponse containing success/error status and updated image URL
 */
export async function updatePetProfileImage(
    petId: number,
    petUuid: string,
    imageFile: File | null,
): Promise<ActionResponse<{ imageUrl?: string }>> {
    try {
        // Scenario 1: Remove existing image
        if (imageFile === null) {
            // Call the server action to update the pet with null values
            const result = await updatePetProfileImageAction(petId, petUuid, null, null);
            if (result === undefined) {
                return {
                    success: true,
                    data: {
                        imageUrl: undefined,
                    },
                };
            }
        }

        // Scenario 2: Upload new image
        // First upload the file to R2 storage
        const uploadResult = await uploadPetImage(imageFile as File);

        if (!uploadResult || !uploadResult.url || !uploadResult.key) {
            return {
                success: false,
                error: "Failed to upload image to storage",
            };
        }

        // Then update the pet record in the database with the new image URL and key
        await updatePetProfileImageAction(petId, petUuid, uploadResult.key, uploadResult.url);

        // Return combined result with the image URL for client-side updates
        return {
            success: true,
            //error: updateResult != undefined ? updateResult.success === false ? updateResult.error : undefined : undefined,
            data: {
                imageUrl: uploadResult.url,
            },
        };
    } catch (error) {
        console.error("Error in updatePetProfileImage:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
