"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Card,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui";
import { toast } from "sonner";
import { getAllUsers, adminResetPassword, toggleUserStatus, deleteUser } from "@/actions";
import { MoreHorizontal, Search, UserCog, UserX, KeyRound, Filter } from "lucide-react";
import Link from "next/link";
import { role_type } from "@prisma/client";

interface User {
    user_id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    created_at: Date;
    last_login: Date | null;
    disabled: boolean | null;
    deleted: boolean | null;
    _count: {
        pets: number;
    };
}

export function UsersList() {
    // State variables
    const [users, setUsers] = useState<User[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState<role_type>(role_type.user);
    const [status, setStatus] = useState("active");
    const [isPending, startTransition] = useTransition();
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState("");

    // Load users with current filters
    const loadUsers = () => {
        startTransition(async () => {
            try {
                const result = await getAllUsers({
                    page: currentPage,
                    pageSize: 10,
                    search: search,
                    role: role,
                    status: status,
                });

                if (result.success && result.data) {
                    setUsers(result.data.users);
                    setTotalPages(result.data.totalPages);
                } else {
                    toast.error("Failed to load users");
                }
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    // Initial load and when filters change
    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, role, status]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page when search changes
            loadUsers();
        }, 500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Handle password reset
    const handleResetPassword = async () => {
        if (!selectedUserId || !newPassword) return;

        startTransition(async () => {
            try {
                const result = await adminResetPassword(selectedUserId, newPassword);

                if (result.success) {
                    toast.success("Password reset successfully");
                    setIsResetDialogOpen(false);
                    setNewPassword("");
                } else {
                    toast.error("Failed to reset password");
                }
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    // Handle toggling user status (enable/disable)
    const handleToggleStatus = async (userId: number) => {
        startTransition(async () => {
            try {
                const result = await toggleUserStatus(userId);

                if (result.success) {
                    toast.success(`User has been ${result.data?.disabled ? "disabled" : "enabled"} successfully`);
                    loadUsers(); // Refresh user list
                } else {
                    toast.error(result.error || "Failed to update user status");
                }
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    // Handle soft deleting a user
    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user? This will mark the account as deleted.")) {
            return;
        }

        startTransition(async () => {
            try {
                const result = await deleteUser(userId);

                if (result.success) {
                    toast.success("User has been deleted successfully");
                    loadUsers(); // Refresh user list
                } else {
                    toast.error("Failed to delete user");
                }
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    // Function to render user status badge
    const getUserStatusBadge = (user: User) => {
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

    return (
        <>
            <Card className="w-full">
                <div className="p-4 border-b">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 md:w-[300px] lg:w-[400px]"
                            />
                        </div>

                        <div className="flex flex-wrap items-center space-x-2">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Filter:</span>
                            </div>

                            <Select value={role} onValueChange={(r: role_type) => setRole(r)}>
                                <SelectTrigger className="h-9 w-[130px]">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={role_type.user}>All Roles</SelectItem>
                                    <SelectItem value={role_type.user}>User</SelectItem>
                                    <SelectItem value={role_type.admin}>Admin</SelectItem>
                                    <SelectItem value={role_type.veterinarian}>Veterinarian</SelectItem>
                                    <SelectItem value={role_type.client}>Clinic</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-9 w-[130px]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                    <SelectItem value="deleted">Deleted</SelectItem>
                                    <SelectItem value="all">All Status</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Pets</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {isPending ? "Loading..." : "No users found"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.user_id}>
                                        <TableCell>
                                            {user.first_name && user.last_name
                                                ? `${user.first_name} ${user.last_name}`
                                                : "No name provided"}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getUserStatusBadge(user)}</TableCell>
                                        <TableCell>{user._count.pets}</TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/users/${user.user_id}`}>
                                                                <UserCog className="mr-2 h-4 w-4" />
                                                                <span>View Details</span>
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedUserId(user.user_id);
                                                                setIsResetDialogOpen(true);
                                                            }}
                                                        >
                                                            <KeyRound className="mr-2 h-4 w-4" />
                                                            <span>Reset Password</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleStatus(user.user_id)}
                                                        >
                                                            <UserCog className="mr-2 h-4 w-4" />
                                                            <span>
                                                                {user.disabled ? "Enable Account" : "Disable Account"}
                                                            </span>
                                                        </DropdownMenuItem>

                                                        {!user.deleted && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteUser(user.user_id)}
                                                            >
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                <span>Delete User</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 border-t">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    aria-disabled={currentPage === 1 || isPending}
                                />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Show pages around current page
                                let pageNumber: number;
                                if (totalPages <= 5) {
                                    pageNumber = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNumber = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + i;
                                } else {
                                    pageNumber = currentPage - 2 + i;
                                }

                                // Only display if pageNumber is valid
                                if (pageNumber > 0 && pageNumber <= totalPages) {
                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <Button
                                                variant={pageNumber === currentPage ? "default" : "outline"}
                                                size="icon"
                                                onClick={() => setCurrentPage(pageNumber)}
                                                disabled={isPending}
                                            >
                                                {pageNumber}
                                            </Button>
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}

                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={isPending}
                                        >
                                            {totalPages}
                                        </Button>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    aria-disabled={currentPage === totalPages || isPending}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </Card>

            {/* Password Reset Dialog */}
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset User Password</DialogTitle>
                        <DialogDescription>
                            Enter a new password for this user. The change will take effect immediately.
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
