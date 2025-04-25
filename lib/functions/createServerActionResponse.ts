import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResponse } from "@/types/server-action-response";

/**
 * Creates a standardized ActionResponse with optional side effects like path revalidation or redirection
 *
 * @param callback The main action function to execute
 * @param options Additional options for revalidation or redirection
 * @returns A properly formatted ActionResponse or void (for redirects)
 */
export async function createActionResponse<T>(
    callback: () => Promise<T>,
    options?: {
        revalidatePath?: string;
        redirectPath?: string;
    },
): Promise<ActionResponse<T> | void> {
    try {
        const result = await callback();

        // Handle path revalidation if specified
        if (options?.revalidatePath) {
            revalidatePath(options.revalidatePath);
        }

        // Success response
        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Action error:", error);

        // Prevent leaking sensitive error details to the client
        // while still providing helpful information for debugging
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    } finally {
        // Handle redirection after try/catch block, as recommended by Next.js docs
        if (options?.redirectPath) {
            redirect(options.redirectPath);
        }
    }
}
