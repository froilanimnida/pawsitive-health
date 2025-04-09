"use server";

import { prisma } from "@/lib";
import { uploadFileToR2, deleteFileFromR2, getPresignedDownloadUrl } from "@/lib";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types/server-action-response";
import { DocumentUploadSchema, type DocumentUploadType } from "@/schemas";

/**
 * Upload a document to R2 and store reference in the database
 */
export async function uploadDocument(values: DocumentUploadType): Promise<ActionResponse<{ documentUrl: string }>> {
    try {
        // Validate input
        const data = DocumentUploadSchema.safeParse(values);
        if (!data.success) {
            return { success: false, error: "Invalid document data" };
        }

        const result = await uploadFileToR2(data.data.file, data.data.fileName, data.data.contentType);

        await prisma.documents.create({
            data: {
                file_name: result.filename,
                file_key: result.key,
                file_url: result.url,
                file_type: result.contentType,
                file_size: result.size,
                pet_id: data.data.petId,
                user_id: data.data.userId,
                record_id: data.data.recordId,
            },
        });

        if (data.data.petId) {
            revalidatePath(`/u/pets`);
        } else if (data.data.recordId) {
            revalidatePath(`/u/medical-records`);
        }

        return {
            success: true,
            data: {
                documentUrl: result.url,
            },
        };
    } catch (error) {
        console.error("Document upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Delete a document from R2 and remove reference from the database
 */
export async function deleteDocument(documentUuid: string): Promise<ActionResponse<{ data: object }>> {
    try {
        const document = await prisma.documents.findUnique({
            where: { document_uuid: documentUuid },
        });

        if (!document) return { success: false, error: "Document not found" };

        await deleteFileFromR2(document.file_key);

        await prisma.documents.delete({
            where: { document_uuid: documentUuid },
        });

        if (document.pet_id) revalidatePath(`/u/pets`);
        else if (document.record_id) revalidatePath(`/u/medical-records`);

        return { success: true, data: { data: {} } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Get a signed URL for downloading a document
 */
export async function getDocumentDownloadUrl(documentUuid: string): Promise<ActionResponse<{ url: string }>> {
    try {
        const document = await prisma.documents.findUnique({
            where: { document_uuid: documentUuid },
        });

        if (!document) return { success: false, error: "Document not found" };

        const presignedUrl = await getPresignedDownloadUrl(document.file_key);

        return {
            success: true,
            data: {
                url: presignedUrl,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
