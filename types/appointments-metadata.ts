/**
 * TypeScript interface for appointment metadata
 * Used for type checking but not for direct Prisma operations
 */
export interface AppointmentMetadata {
    googleCalendarEventId?: string | null;
    [key: string]: unknown; // Allow other properties
}

/**
 * Helper function to safely create or update appointment metadata
 * This ensures proper handling of the JSON structure for Prisma
 *
 * The key change here is that we're using Prisma.JsonValue compatible return type
 */
export function createAppointmentMetadata(
    existingMetadata: unknown | null,
    updates: Partial<AppointmentMetadata>,
): unknown {
    // Start with empty object if no metadata exists
    const baseMetadata = existingMetadata || {};

    // Create a plain JavaScript object (not using the interface as a type)
    // This will be properly serialized by Prisma
    return {
        ...(typeof baseMetadata === "object" ? baseMetadata : {}),
        ...updates,
    };
}
