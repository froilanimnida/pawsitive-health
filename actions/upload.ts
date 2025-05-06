"use server";

import { uploadFileToR2, getPresignedDownloadUrl } from "@/lib/r2-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

/**
 * Server action to upload a file to R2 storage
 */
export async function uploadFile(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        // Get file from form data
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // Extract file details
        const filename = file.name;
        const contentType = file.type;
        const folder = (formData.get("folder") as string) || "documents";

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to R2
        const result = await uploadFileToR2(buffer, filename, contentType, folder);

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to upload file",
        };
    }
}

/**
 * Refresh a presigned URL that might be expiring
 */
export async function refreshFileUrl(key: string) {
    try {
        const newUrl = await getPresignedDownloadUrl(key);
        return { success: true, url: newUrl };
    } catch {
        return { success: false, error: "Failed to refresh URL" };
    }
}
