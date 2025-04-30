"use client";
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
import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "../ui/file-upload";
import { updatePetProfileImage } from "@/lib/functions/upload/update-pet-profile-image";

function PetProfileImage({
    name,
    pet_id,
    petUuid,
    profile_picture_url,
}: {
    name: string;
    pet_id: number;
    petUuid: string;
    profile_picture_url: string | null;
}) {
    const [isHovering, setIsHovering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(profile_picture_url);

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
            // Use the new comprehensive function that handles both upload and DB update
            const result = await updatePetProfileImage(pet_id, petUuid, profileImage);
            console.log(result);

            if (result.success) {
                toast.success("Pet profile picture updated successfully");
                // We need to refresh the image URL from the result
                if (result.data?.imageUrl) {
                    setImageUrl(result.data.imageUrl);
                }
                // Close the dialog
                setShowImageDialog(false);
            } else {
                toast.error(result.error || "Failed to update pet profile picture");
            }
        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        setIsUploading(true);
        try {
            // Use null to indicate image removal
            const result = await updatePetProfileImage(pet_id, petUuid, null);

            if (result.success) {
                toast.success("Profile picture removed");
                // Update local state
                setImageUrl(null);
                setProfileImage(null);
                // Close the dialog
                setShowImageDialog(false);
            } else {
                toast.error(result.error || "Failed to remove profile picture");
            }
        } catch (error) {
            console.error("Error removing profile picture:", error);
            toast.error("Failed to remove image");
        } finally {
            setIsUploading(false);
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
                    {imageUrl ? (
                        <AvatarImage src={imageUrl} alt={name} />
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
                            currentImageUrl={imageUrl || null}
                            label={`Upload a picture of ${name}`}
                        />
                    </div>

                    <div className="flex justify-between gap-3">
                        {/* Add Remove button if there's a current image */}
                        {imageUrl && (
                            <Button variant="destructive" onClick={handleRemoveImage} disabled={isUploading}>
                                Remove Image
                            </Button>
                        )}

                        <div className="flex gap-3 ml-auto">
                            <Button variant="outline" onClick={() => setShowImageDialog(false)} disabled={isUploading}>
                                Cancel
                            </Button>
                            <Button onClick={handleImageUpdate} disabled={isUploading || !profileImage}>
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
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default PetProfileImage;
