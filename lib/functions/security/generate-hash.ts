/**
 * Generates a SHA-256 hash of the provided message string.
 *
 * @param message - The input string to be hashed
 * @returns A Promise that resolves to a hexadecimal string representation of the SHA-256 hash
 *
 * @example
 * ```typescript
 * const hash = await sha256Hash("Hello, world!");
 * console.log(hash); // "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3"
 * ```
 */
export const sha256Hash = async (message: string): Promise<string> => {
    // Encode message as UTF-8
    const msgUint8 = new TextEncoder().encode(message);
    // Hash the message
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    // Convert buffer to byte array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert bytes to hex string
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
};
