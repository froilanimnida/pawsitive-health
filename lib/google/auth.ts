/**
 * Google Calendar Authentication Utilities
 */

interface GoogleTokenData {
    access_token: string;
    refresh_token?: string;
    expiry_date: number;
    token_type: string;
    scope: string;
}

/**
 * Check if the current token is expired and refresh if needed
 */
export async function refreshTokenIfNeeded(tokenData: GoogleTokenData): Promise<GoogleTokenData | null> {
    // Check if we need to refresh the token
    const isExpired = Date.now() > tokenData.expiry_date - 60000; // 1 minute buffer

    if (!isExpired) {
        return tokenData; // Token is still valid
    }

    // Token is expired, need to refresh
    if (!tokenData.refresh_token) {
        console.error("Cannot refresh token: No refresh token available");
        return null;
    }

    try {
        const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID || "",
                client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
                refresh_token: tokenData.refresh_token,
                grant_type: "refresh_token",
            }),
        });

        if (!refreshResponse.ok) {
            const errorData = await refreshResponse.json();
            console.error("Token refresh failed:", errorData);
            return null;
        }

        const newTokens = await refreshResponse.json();

        // Return new token data, preserving the refresh token
        return {
            access_token: newTokens.access_token,
            refresh_token: tokenData.refresh_token, // Keep existing refresh token
            expiry_date: Date.now() + newTokens.expires_in * 1000,
            token_type: newTokens.token_type || tokenData.token_type,
            scope: newTokens.scope || tokenData.scope,
        };
    } catch (error) {
        console.error("Error refreshing Google token:", error);
        return null;
    }
}

/**
 * Validates that a token has the required scopes
 */
export function validateTokenScopes(tokenData: GoogleTokenData, requiredScopes: string[]): boolean {
    if (!tokenData.scope) return false;

    const tokenScopes = tokenData.scope.split(" ");
    return requiredScopes.every((scope) => tokenScopes.includes(scope));
}
