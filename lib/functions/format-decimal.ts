/**
 * Safely formats a Decimal or number value to a localized string
 */
export function formatDecimal(
    value: unknown,
    options: Intl.NumberFormatOptions = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    },
): string {
    if (value === null || value === undefined) {
        return "0.00";
    }

    try {
        const numValue = typeof value === "object" && value !== null ? Number(value.toString()) : Number(value);

        return numValue.toLocaleString("en-US", options);
    } catch {
        return String(value) || "0.00";
    }
}
