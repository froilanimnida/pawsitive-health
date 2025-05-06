/**
 * Password strength validator
 * Checks if a password meets the following criteria:
 * 1. Minimum length of 8 characters
 * 2. Contains at least one uppercase letter
 * 3. Contains at least one lowercase letter
 * 4. Contains at least one number
 * 5. Contains at least one special character
 *
 * @param password - The password to validate
 * @returns boolean - True if password meets all criteria, false otherwise
 */
export function isStrongPassword(password: string): boolean {
    // Check if password is undefined or empty
    if (!password) {
        return false;
    }

    // Check minimum length
    if (password.length < 8) {
        return false;
    }

    // Check for presence of uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Check for presence of lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }

    // Check for presence of number
    if (!/[0-9]/.test(password)) {
        return false;
    }

    // Check for presence of special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return false;
    }

    return true;
}

/**
 * Get detailed feedback about password strength
 *
 * @param password - The password to evaluate
 * @returns object containing validation results and feedback
 */
export function getPasswordStrengthFeedback(password: string): {
    isStrong: boolean;
    feedback: string[];
} {
    const feedback: string[] = [];

    if (!password || password.length < 8) {
        feedback.push("Password should be at least 8 characters long");
    }

    if (password && !/[A-Z]/.test(password)) {
        feedback.push("Password should contain at least one uppercase letter");
    }

    if (password && !/[a-z]/.test(password)) {
        feedback.push("Password should contain at least one lowercase letter");
    }

    if (password && !/[0-9]/.test(password)) {
        feedback.push("Password should contain at least one number");
    }

    if (password && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        feedback.push("Password should contain at least one special character");
    }

    return {
        isStrong: feedback.length === 0,
        feedback,
    };
}
