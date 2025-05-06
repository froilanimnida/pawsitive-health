"use server";

import { prisma } from "@/lib";
import { type ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hashPassword } from "@/lib";
import { Prisma, type role_type, type users } from "@prisma/client";

// Custom user type with count of pets
type UserWithPetCount = Prisma.usersGetPayload<{
    include: {
        _count: {
            select: { pets: true };
        };
    };
}>;

interface GetAllUsersParams {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: role_type;
    status?: string;
}

/**
 * Get all users with pagination, search, and filtering
 */
export const getAllUsers = async ({
    page = 1,
    pageSize = 10,
    search = "",
    role,
    status,
}: GetAllUsersParams = {}): Promise<
    ActionResponse<{
        users: UserWithPetCount[];
        totalUsers: number;
        totalPages: number;
        currentPage: number;
    }>
> => {
    try {
        const session = await getServerSession(authOptions);
        // Only admins can access this function
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized" };
        }

        const where: Prisma.usersWhereInput = {};

        // Apply search filter
        if (search) {
            where.OR = [
                { first_name: { contains: search, mode: "insensitive" } },
                { last_name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone_number: { contains: search } },
            ];
        }

        // Apply role filter
        if (role) {
            where.role = role;
        }

        // Apply status filter (active, disabled, deleted)
        if (status) {
            if (status === "active") {
                where.disabled = false;
                where.deleted = false;
            } else if (status === "disabled") {
                where.disabled = true;
            } else if (status === "deleted") {
                where.deleted = true;
            }
        }

        // Get total count for pagination
        const totalUsers = await prisma.users.count({ where });

        // Calculate pagination
        const skip = (page - 1) * pageSize;
        const totalPages = Math.ceil(totalUsers / pageSize);

        // Get users with pagination
        const users = await prisma.users.findMany({
            where,
            include: {
                _count: {
                    select: {
                        pets: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
            skip,
            take: pageSize,
        });

        return {
            success: true,
            data: {
                users,
                totalUsers,
                totalPages,
                currentPage: page,
            },
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};
/**
 * Get detailed information about a specific user
 */
export async function getUser(user_id: number): Promise<ActionResponse<{ user: users }>>;
export async function getUser(user_uuid: string): Promise<ActionResponse<{ user: users }>>;
export async function getUser(idOrUuid: string | number): Promise<ActionResponse<{ user: users }>> {
    try {
        const session = await getServerSession(authOptions);
        // Only admins can access this function
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized" };
        }

        const where = typeof idOrUuid === "number" ? { user_id: idOrUuid } : { user_uuid: idOrUuid };

        const user = await prisma.users.findUnique({ where });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: { user } };
    } catch (error) {
        console.error("Error fetching user details:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Reset a user's password (admin function - no OTP required)
 */
export const adminResetPassword = async (userId: number, newPassword: string): Promise<ActionResponse<boolean>> => {
    try {
        const session = await getServerSession(authOptions);
        // Only admins can access this function
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized" };
        }

        // Validate password length
        if (newPassword.length < 8) {
            return { success: false, error: "Password must be at least 8 characters long" };
        }

        const user = await prisma.users.findUnique({
            where: { user_id: userId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user with new password
        await prisma.users.update({
            where: { user_id: userId },
            data: {
                password_hash: hashedPassword,
                // Clear any existing reset tokens or OTP
                password_reset_token: null,
                password_reset_expires_at: null,
                otp_token: null,
                otp_expires_at: null,
            },
        });

        revalidatePath(`/admin/users/${userId}`);
        return { success: true, data: true };
    } catch (error) {
        console.error("Error resetting password:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

/**
 * Toggle user status (enable/disable account)
 */
export const toggleUserStatus = async (userId: number): Promise<ActionResponse<{ disabled: boolean }>> => {
    try {
        const session = await getServerSession(authOptions);
        // Only admins can access this function
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized" };
        }

        // Get current user status
        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            select: { disabled: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Toggle the disabled status
        const updatedUser = await prisma.users.update({
            where: { user_id: userId },
            data: {
                disabled: !user.disabled,
            },
        });
        revalidatePath(`/admin/users/${updatedUser.user_uuid}`);
        return {
            success: true,
            data: { disabled: updatedUser.disabled ?? false },
        };
    } catch (error) {
        console.error("Error toggling user status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

/**
 * Soft delete a user account
 */
export const deleteUser = async (userId: number): Promise<ActionResponse<boolean>> => {
    try {
        const session = await getServerSession(authOptions);
        // Only admins can access this function
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized" };
        }

        // Apply soft delete (set deleted = true and timestamp)
        await prisma.users.update({
            where: { user_id: userId },
            data: {
                deleted: true,
                deleted_at: new Date(),
            },
        });

        // Also mark any pets as deleted
        await prisma.pets.updateMany({
            where: { user_id: userId },
            data: {
                deleted: true,
                deleted_at: new Date(),
            },
        });

        revalidatePath(`/admin/users`);
        return { success: true, data: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};
