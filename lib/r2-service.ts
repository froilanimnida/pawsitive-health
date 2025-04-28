import type { FileUploadResult } from "@/types/file-upload-result-types";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

//const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "pawsitive";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Fix: Extract just the endpoint URL without the bucket name
const R2_ENDPOINT =
    process.env.R2_ENDPOINT?.split("/pawsitive")[0] ||
    "https://b700c33a8dd77e29da09cb700c5c6959.r2.cloudflarestorage.com";

// Create S3 client with Cloudflare R2 endpoint
const r2Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
});

/**
 * Upload a file to R2 storage
 */
export async function uploadFileToR2(
    file: Buffer | Blob,
    filename: string,
    contentType: string,
    folder: string = "documents",
): Promise<FileUploadResult> {
    try {
        const fileBuffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;
        const key = `${folder}/${uuid()}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await r2Client.send(command);

        return {
            key,
            url: `${R2_PUBLIC_URL}/${key}`,
            filename,
            contentType,
            size: fileBuffer.length,
        };
    } catch (error) {
        console.error("Error in uploadFileToR2:", error);
        throw error;
    }
}

/**
 * Generate a presigned URL for downloading a file (valid for limited time)
 */
export async function getPresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour expiration
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFileFromR2(key: string): Promise<boolean> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
        return true;
    } catch (error) {
        console.error("Error deleting file from R2:", error);
        return false;
    }
}
