import { z } from "zod";

export const DocumentUploadSchema = z.object({
    file: z.instanceof(Blob),
    fileName: z.string().min(1),
    contentType: z.string().min(1),
    petId: z.number().optional(),
    userId: z.number().optional(),
    recordId: z.number().optional(),
});

export type DocumentUploadType = z.infer<typeof DocumentUploadSchema>;
