"use client";
import { updatePet } from "@/actions";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
    Dialog,
    Button,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui";
import { toTitleCase } from "@/lib";
import { uploadPetImage } from "@/lib/functions/upload/upload-pet-image";
import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "../ui/file-upload";
function PetProfileImage({
    name,
    pet_id,
    profile_picture_url,
    weight_kg,
}: {
    name: string;
    pet_id: number;
    profile_picture_url: string | null;
    weight_kg: string;
}) {
    const [isHovering, setIsHovering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const handleImageClick = () => {
        setShowImageDialog(true);
    };

    const handleFileChange = (file: File | null) => {
        setProfileImage(file);
    };

    const handleImageUpdate = async () => {
        if (!profileImage) {
            setShowImageDialog(false);
            return;
        }

        setIsUploading(true);
        try {
            // Upload the image to R2
            const uploadResult = await uploadPetImage(profileImage);

            // Update the pet with the new profile picture URL
            const updateResult = await updatePet({
                pet_id: pet_id,
                name: name,
                weight_kg: Number(weight_kg),
                profile_picture_url: uploadResult.url,
            });

            if (updateResult === undefined) {
                toast.success("Pet profile picture updated successfully");
                // Force a reload to show the updated image
                window.location.reload();
            } else {
                toast.error("Failed to update pet profile picture");
            }
        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            setShowImageDialog(false);
        }
    };

    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <>
            <div
                className="relative cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleImageClick}
            >
                <Avatar className="h-32 w-32 border-2 border-primary/10">
                    {profile_picture_url ? (
                        <AvatarImage src={profile_picture_url} alt={name} />
                    ) : (
                        <AvatarFallback className="text-3xl bg-primary/10">{getInitials(name)}</AvatarFallback>
                    )}
                </Avatar>

                {/* Camera overlay on hover */}
                {isHovering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                )}
            </div>

            <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Pet Profile Picture</DialogTitle>
                        <DialogDescription>Upload a new profile picture for {toTitleCase(name)}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <FileUpload
                            onFileChange={handleFileChange}
                            currentImageUrl={profile_picture_url || null}
                            label={`Upload a picture of ${name}`}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowImageDialog(false)} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleImageUpdate} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default PetProfileImage;
