"use client";

import { useTransition } from "react";
import { adminResetPassword, toggleUserStatus, deleteUser } from "@/actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Button,
    Badge,
    Avatar,
    AvatarFallback,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, KeyRound, UserCog, UserX, Shield, PawPrint } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { pets, users } from "@prisma/client";
import { useState } from "react";

export default function UserDetailView({ user, petCount, pets }: { user: users; petCount: number; pets: pets[] | [] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    // User status indicator badge
    const userStatusBadge = user.deleted ? (
        <Badge variant="outline" className="bg-red-100 text-red-800">
            Deleted
        </Badge>
    ) : user.disabled ? (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Disabled
        </Badge>
    ) : (
        <Badge variant="outline" className="bg-green-100 text-green-800">
            Active
        </Badge>
    );

    // Action handlers
    const handleResetPassword = () => {
        if (newPassword.length < 8) return;

        startTransition(async () => {
            try {
                const result = await adminResetPassword(user.user_id, newPassword);

                if (result.success) {
                    toast.success("Password has been reset successfully");
                    setIsResetDialogOpen(false);
                    setNewPassword("");
                } else {
                    toast.error(result.error || "Failed to reset password");
                }
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    const handleToggleStatus = () => {
        startTransition(async () => {
            try {
                const result = await toggleUserStatus(user.user_id);

                if (result.success) {
                    toast.success(`User has been ${result.data?.disabled ? "disabled" : "enabled"} successfully`);
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to update user status");
                }
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    const handleDeleteUser = () => {
        if (!confirm("Are you sure you want to delete this user? This will mark the account as deleted.")) {
            return;
        }

        startTransition(async () => {
            try {
                const result = await deleteUser(user.user_id);

                if (result.success) {
                    toast.success("User has been deleted successfully");
                    router.push("/admin/users");
                } else {
                    toast.error(result.error || "Failed to delete user");
                }
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 mb-6">
                <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-semibold">
                            {user.first_name} {user.last_name}
                        </h2>
                        {userStatusBadge}
                        <Badge variant="secondary" className="capitalize">
                            {user.role}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="text-muted-foreground">{user.phone_number || "No phone number"}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mb-6">
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setIsResetDialogOpen(true)}
                >
                    <KeyRound className="h-4 w-4" />
                    Reset Password
                </Button>
                <Button
                    variant={user.disabled ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={handleToggleStatus}
                    disabled={isPending}
                >
                    <UserCog className="h-4 w-4" />
                    {user.disabled ? "Enable Account" : "Disable Account"}
                </Button>
                {!user.deleted && (
                    <Button
                        variant="destructive"
                        className="flex items-center gap-2"
                        onClick={handleDeleteUser}
                        disabled={isPending}
                    >
                        <UserX className="h-4 w-4" />
                        Delete User
                    </Button>
                )}
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pets">Pets ({petCount})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Account Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium">User ID</dt>
                                        <dd className="text-muted-foreground">{user.user_id}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium">Email</dt>
                                        <dd className="break-all">{user.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium">Role</dt>
                                        <dd className="capitalize">{user.role}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium">Status</dt>
                                        <dd>{user.deleted ? "Deleted" : user.disabled ? "Disabled" : "Active"}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="h-5 w-5" />
                                    Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium">Account Created</dt>
                                        <dd>
                                            {new Date(user.created_at).toLocaleDateString()} (
                                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })})
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium">Last Updated</dt>
                                        <dd>
                                            {user.updated_at
                                                ? `${new Date(user.updated_at).toLocaleDateString()} (${formatDistanceToNow(
                                                      new Date(user.updated_at),
                                                      { addSuffix: true },
                                                  )})`
                                                : "Never"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium">Last Login</dt>
                                        <dd>
                                            {user.last_login
                                                ? `${new Date(user.last_login).toLocaleDateString()} (${formatDistanceToNow(
                                                      new Date(user.last_login),
                                                      { addSuffix: true },
                                                  )})`
                                                : "Never"}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="pets">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PawPrint className="h-5 w-5" />
                                Pet Information
                            </CardTitle>
                            <CardDescription>
                                {petCount > 0
                                    ? `${user.first_name || "User"} has ${petCount} pet${petCount !== 1 ? "s" : ""} registered`
                                    : "This user has no pets registered"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pets.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No pets found</div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {pets.map((pet) => (
                                        <Card key={pet.pet_id}>
                                            <CardHeader>
                                                <CardTitle>{pet.name}</CardTitle>
                                                <CardDescription className="capitalize">
                                                    {pet.species} | {pet.breed || "No breed specified"}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">
                                                    Added{" "}
                                                    {formatDistanceToNow(new Date(pet.created_at), { addSuffix: true })}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Password Reset Dialog */}
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset User Password</DialogTitle>
                        <DialogDescription>
                            Enter a new password for {user.first_name} {user.last_name}. The change will take effect
                            immediately without requiring OTP verification.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm font-medium">
                                New Password
                            </label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 8 characters long.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleResetPassword} disabled={newPassword.length < 8 || isPending}>
                            Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
