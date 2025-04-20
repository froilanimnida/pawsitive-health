/**
 * Returns the current date-time in UTC
 * @returns {Date} UTC-based JavaScript Date object
 */
export const getCurrentUtcDate = (): Date => {
    // The Date constructor by default creates a UTC-based timestamp,
    // but we clarify this for semantic purposes.
    return new Date(); // already UTC under the hood
};

/**
 * Returns a formatted ISO string in UTC
 * @returns {string} ISO 8601 formatted string in UTC (e.g., '2025-04-20T13:00:00.000Z')
 */
export const getCurrentUtcISOString = (): string => {
    return new Date().toISOString();
};
