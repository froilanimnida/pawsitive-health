"use client";

import { useEffect, useState, useTransition } from "react";
import { getUserDetails, adminResetPassword, toggleUserStatus, deleteUser } from "@/actions";
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
    Separator,
} from "@/components/ui";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, KeyRound, UserCog, UserX, Shield, PawPrint } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { pets, user_settings } from "@prisma/client";

type UserSettings = {
    theme_mode: string;
    notification_preferences: user_settings;
    google_calendar_sync: boolean;
};

type User = {
    user_id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    role: string;
    created_at: Date;
    updated_at: Date | null;
    last_login: Date | null;
    disabled: boolean | null;
    deleted: boolean | null;
    pets: pets[];
    user_settings: UserSettings | null;
    _count: {
        pets: number;
        notifications: number;
    };
};

export default function UserDetailView({ uuid }: { uuid: string }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsLoading(true);
            try {
                const result = await getUserDetails(uuid);

                if (result.success && result.data) {
                    setUser(result.data.user);
                } else {
                    toast.error(
                        result
                            ? !result.success
                                ? result.error
                                : "Failed to load user details"
                            : "Failed to load user details",
                    );
                    notFound();
                }
            } catch (error) {
                console.error("Error loading user details:", error);
                notFound();
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [uuid]);

    // Handle password reset
    const handleResetPassword = async () => {
        if (!newPassword || !user) return;

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

    // Handle toggling user status (enable/disable)
    const handleToggleStatus = async () => {
        if (!user) return;

        startTransition(async () => {
            try {
                const result = await toggleUserStatus(user.user_id);

                if (result.success) {
                    toast.success(`User has been ${result.data?.disabled ? "disabled" : "enabled"} successfully`);

                    // Update local state to reflect the change
                    setUser((prev) => (prev ? { ...prev, disabled: result.data?.disabled || false } : null));
                } else {
                    toast.error(result.error || "Failed to update user status");
                }
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    // Handle soft deleting a user
    const handleDeleteUser = async () => {
        if (!user) return;

        if (!confirm("Are you sure you want to delete this user? This will mark the account as deleted.")) {
            return;
        }

        startTransition(async () => {
            try {
                const result = await deleteUser(user.user_id);

                if (result.success) {
                    //toast({
                    //    title: "Success",
                    //    description: "User has been deleted successfully",
                    //});
                    toast.success("User has been deleted successfully");
                    // Navigate back to the users list
                    router.push("/admin/users");
                } else {
                    //toast({
                    //    title: "Error",
                    //    description: result.error || "Failed to delete user",
                    //    variant: "destructive",
                    //});
                    toast.error(result.error || "Failed to delete user");
                }
            } catch {
                //toast({
                //    title: "Error",
                //    description: "An unexpected error occurred",
                //    variant: "destructive",
                //});
                toast.error("An unexpected error occurred");
            }
        });
    };

    // Function to render user status badge
    const getUserStatusBadge = () => {
        if (!user) return null;

        if (user.deleted) {
            return (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                    Deleted
                </Badge>
            );
        } else if (user.disabled) {
            return (
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    Disabled
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                    Active
                </Badge>
            );
        }
    };

    if (isLoading) {
        return <p>Loading user details...</p>;
    }

    if (!user) {
        return <p>User not found</p>;
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">
                        {user.first_name && user.first_name.charAt(0).toUpperCase()}
                        {user.last_name && user.last_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-semibold">
                            {user.first_name} {user.last_name}
                        </h2>
                        {getUserStatusBadge()}
                        <Badge variant="secondary" className="capitalize">
                            {user.role}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="text-muted-foreground">{user.phone_number || "No phone number"}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
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
                >
                    <UserCog className="h-4 w-4" />
                    {user.disabled ? "Enable Account" : "Disable Account"}
                </Button>
                {!user.deleted && (
                    <Button variant="destructive" className="flex items-center gap-2" onClick={handleDeleteUser}>
                        <UserX className="h-4 w-4" />
                        Delete User
                    </Button>
                )}
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pets">Pets ({user._count.pets})</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
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
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium">User ID</p>
                                        <p className="text-muted-foreground">{user.user_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="break-all">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Role</p>
                                        <p className="capitalize">{user.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <p>{user.deleted ? "Deleted" : user.disabled ? "Disabled" : "Active"}</p>
                                    </div>
                                </div>
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
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium">Account Created</p>
                                        <p>
                                            {new Date(user.created_at).toLocaleDateString()} (
                                            {formatDistanceToNow(new Date(user.created_at), {
                                                addSuffix: true,
                                            })}
                                            )
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Last Updated</p>
                                        <p>
                                            {user.updated_at
                                                ? `${new Date(user.updated_at).toLocaleDateString()} (${formatDistanceToNow(
                                                      new Date(user.updated_at),
                                                      { addSuffix: true },
                                                  )})`
                                                : "Never"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Last Login</p>
                                        <p>
                                            {user.last_login
                                                ? `${new Date(user.last_login).toLocaleDateString()} (${formatDistanceToNow(
                                                      new Date(user.last_login),
                                                      { addSuffix: true },
                                                  )})`
                                                : "Never"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Unread Notifications</p>
                                        <p>{user._count.notifications}</p>
                                    </div>
                                </div>
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
                                {user._count.pets > 0
                                    ? `${user.first_name || "User"} has ${user._count.pets} pet${
                                          user._count.pets !== 1 ? "s" : ""
                                      } registered`
                                    : "This user has no pets registered"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.pets.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No pets found</div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {user.pets.map((pet) => (
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

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Preferences</CardTitle>
                            <CardDescription>Settings and preferences for this user account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!user.user_settings ? (
                                <div className="text-center py-8 text-muted-foreground">No settings configured</div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium">Theme Preference</p>
                                        <p className="capitalize">
                                            {user.user_settings.theme_mode || "System default"}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium">Google Calendar Integration</p>
                                        <p>{user.user_settings.google_calendar_sync ? "Enabled" : "Disabled"}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium">Notification Preferences</p>
                                        <pre className="mt-2 rounded-md bg-muted p-4 text-sm">
                                            {JSON.stringify(user.user_settings.notification_preferences, null, 2)}
                                        </pre>
                                    </div>
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
