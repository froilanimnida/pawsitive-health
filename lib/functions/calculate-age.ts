/**
 * Calculate age from a date of birth with a detailed breakdown.
 * @param dateOfBirth The date of birth
 * @param format Whether to return a formatted string, just years, or an object breakdown
 * @returns Either a string with formatted age, just years, or an object with years, months, and days
 */
export const calculateAge = (dateOfBirth: Date, format: "full" | "years" | "object" = "years") => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    // Basic year calculation
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust if birthday hasn't occurred yet in the current year
    if (months < 0 || (months === 0 && days < 0)) {
        years--;
        months += 12;
    }

    // Adjust days if negative
    if (days < 0) {
        // Borrow days from the previous month
        const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += previousMonth;
        months--;
    }

    // Return just the years if format is "years"
    if (format === "years") return years;

    // Return detailed object if format is "object"
    if (format === "object") return { years, months, days };

    // Format as a string if "full"
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);

    return parts.join(", ");
};
