import { NextRequest, NextResponse } from "next/server";
import { deleteFileFromR2, uploadFileToR2 } from "@/lib/r2-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        // Validate file size - 5MB limit
        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            return NextResponse.json({ error: `File size must be less than ${maxSizeMB}MB` }, { status: 400 });
        }

        // Convert the file to a buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to R2
        const result = await uploadFileToR2(
            buffer,
            file.name,
            file.type,
            "pet-profiles", // Use a dedicated folder for pet images
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Error uploading pet image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const fileKey = formData.get("fileKey") as string;

        if (!fileKey) {
            return NextResponse.json({ error: "No file key provided" }, { status: 400 });
        }

        // Delete from R2
        const result = await deleteFileFromR2(fileKey);

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Error deleting pet image:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}
