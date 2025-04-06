type DateFormatType = "short" | "medium" | "long" | "full";
type TimeFormatType = "12h" | "24h";

interface FormatOptions {
    dateFormat?: DateFormatType;
    timeFormat?: TimeFormatType;
    includeTime?: boolean;
    includeDate?: boolean;
    includeYear?: boolean;
    includeSeconds?: boolean;
}

const defaultOptions: FormatOptions = {
    dateFormat: "short",
    timeFormat: "12h",
    includeTime: true,
    includeDate: true,
    includeYear: true,
    includeSeconds: false,
};

/**
 * Format a date based on common application settings
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number, options: FormatOptions = {}): string => {
    const mergedOptions = { ...defaultOptions, ...options };
    const dateObj = new Date(date);

    let result = "";

    if (mergedOptions.includeDate) {
        const dateOptions: Intl.DateTimeFormatOptions = {};

        switch (mergedOptions.dateFormat) {
            case "short":
                dateOptions.month = "2-digit";
                dateOptions.day = "2-digit";
                dateOptions.year = mergedOptions.includeYear ? "2-digit" : undefined;
                break;
            case "medium":
                dateOptions.month = "short";
                dateOptions.day = "numeric";
                dateOptions.year = mergedOptions.includeYear ? "numeric" : undefined;
                break;
            case "long":
                dateOptions.month = "long";
                dateOptions.day = "numeric";
                dateOptions.year = mergedOptions.includeYear ? "numeric" : undefined;
                break;
            case "full":
                dateOptions.weekday = "long";
                dateOptions.month = "long";
                dateOptions.day = "numeric";
                dateOptions.year = mergedOptions.includeYear ? "numeric" : undefined;
                break;
        }

        result = dateObj.toLocaleDateString("en-US", dateOptions);
    }

    // Format the time part if requested
    if (mergedOptions.includeTime) {
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: mergedOptions.timeFormat === "24h" ? "2-digit" : "numeric",
            minute: "2-digit",
            second: mergedOptions.includeSeconds ? "2-digit" : undefined,
            hour12: mergedOptions.timeFormat === "12h",
        };

        const timeString = dateObj.toLocaleTimeString("en-US", timeOptions);

        // Combine date and time if both are included
        if (mergedOptions.includeDate) {
            result += ` at ${timeString}`;
        } else {
            result = timeString;
        }
    }

    return result;
};

/**
 * Format a date for display in the UI (short format)
 */
export const formatDateForDisplay = (date: Date | string | number): string => {
    return formatDate(date, { dateFormat: "short", includeYear: true });
};

/**
 * Format a time for display in the UI
 */
export const formatTimeForDisplay = (date: Date | string | number): string => {
    return formatDate(date, { includeDate: false, includeTime: true });
};

/**
 * Format a full date and time for display in appointments
 */
export const formatAppointmentDateTime = (date: Date | string | number): string => {
    return formatDate(date, { dateFormat: "medium", timeFormat: "12h" });
};
