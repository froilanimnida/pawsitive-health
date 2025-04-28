"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui";
import { FileUpload } from "@/components/ui/file-upload";
import { Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { calculateAge, toTitleCase } from "@/lib";
import { updatePet } from "@/actions/pets";
import { uploadPetImage } from "@/lib/functions/upload/upload-pet-image";
import type { Pets } from "@/types";

interface PetCardProps {
    pet: Pets;
}

export default function PetCard({ pet }: PetCardProps) {
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
                pet_id: pet.pet_id,
                name: pet.name,
                weight_kg: Number(pet.weight_kg),
                profile_picture_url: uploadResult.url,
            });

            if (updateResult === undefined) {
                toast.success("Pet profile picture updated successfully");
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
            <Card className="h-full flex flex-col">
                <div
                    className="relative w-full flex justify-center pt-6"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Avatar className="h-24 w-24 cursor-pointer" onClick={handleImageClick}>
                        {pet.profile_picture_url ? (
                            <AvatarImage src={pet.profile_picture_url} alt={pet.name} />
                        ) : (
                            <AvatarFallback className="text-3xl bg-primary/10">{getInitials(pet.name)}</AvatarFallback>
                        )}
                    </Avatar>

                    {/* Camera overlay on hover */}
                    {isHovering && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full h-24 w-24 mx-auto cursor-pointer"
                            onClick={handleImageClick}
                        >
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                    )}
                </div>

                <CardHeader>
                    <CardTitle className="text-center">{toTitleCase(pet.name)}</CardTitle>
                    <CardDescription className="text-center">{toTitleCase(pet.breed)}</CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="font-medium">Species:</span> {toTitleCase(pet.species)}
                        </p>
                        {pet.date_of_birth && (
                            <p className="text-sm">
                                <span className="font-medium">Age:</span>{" "}
                                {String(calculateAge(new Date(pet.date_of_birth), "full"))}
                            </p>
                        )}
                        <p className="text-sm">
                            <span className="font-medium">Weight:</span> {pet.weight_kg} kg
                        </p>
                    </div>
                </CardContent>

                <CardFooter>
                    <Link href={`/user/pets/${pet.pet_uuid}`} className="w-full">
                        <Button className="w-full">View Details</Button>
                    </Link>
                </CardFooter>
            </Card>

            <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Pet Profile Picture</DialogTitle>
                        <DialogDescription>Upload a new profile picture for {toTitleCase(pet.name)}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <FileUpload
                            onFileChange={handleFileChange}
                            currentImageUrl={pet.profile_picture_url || null}
                            label={`Upload a picture of ${pet.name}`}
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
