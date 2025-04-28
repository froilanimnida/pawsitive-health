import type { FileUploadResult } from "@/types/file-upload-result-types";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

// Access environment variables properly
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "pawsitive";

// Fix: Remove the bucket name from the endpoint URL
const R2_ENDPOINT = process.env.R2_ENDPOINT?.includes("/pawsitive")
    ? process.env.R2_ENDPOINT.split("/pawsitive")[0] // Remove bucket from URL if present
    : process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Create S3 client with correct endpoint (without bucket name)
const r2Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload a file to R2 storage and return a presigned URL
 */
export async function uploadFileToR2(
    file: Buffer | Blob,
    filename: string,
    contentType: string,
    folder: string = "documents",
): Promise<FileUploadResult> {
    try {
        // Verify required credentials are present
        if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
            throw new Error("R2 credentials are not properly configured");
        }

        const fileBuffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;
        const key = `${folder}/${uuid()}-${filename}`;

        // Upload the file
        const uploadCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await r2Client.send(uploadCommand);

        // Generate a presigned URL for accessing this file (valid for 7 days)
        const url = await getPresignedDownloadUrl(key, 7 * 24 * 60 * 60); // 7 days in seconds

        return {
            key,
            url,
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
 * Generate a presigned URL for downloading a file
 * @param key File key in the bucket
 * @param expiresIn Expiration time in seconds (default: 1 hour)
 */
export async function getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for uploading a file directly from browser
 * @param key The key where the file will be stored
 * @param contentType The content type of the file
 * @param expiresIn Expiration time in seconds (default: 1 hour)
 */
export async function createPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
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
