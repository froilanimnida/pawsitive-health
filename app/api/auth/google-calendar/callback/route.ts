import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateCalendarIntegration } from "@/actions/user";

// Access environment variables once at the module level
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Error handling
    if (error || !code) {
        console.error("Google OAuth error:", error);
        return NextResponse.redirect(new URL("/user/settings/error=auth_failed", request.url));
    }

    try {
        // Get authenticated user
        const session = await auth();
        if (!session?.user?.email) {
            throw new Error("User not authenticated");
        }

        // Validate that we have necessary credentials
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            console.error("Missing Google OAuth credentials in server environment");
            throw new Error("Google Calendar integration is not properly configured on the server");
        }

        const redirectUri = `${FRONTEND_URL}/api/auth/google-calendar/callback`;
        console.log("Using redirect URI:", redirectUri);

        // Exchange the authorization code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Google token error:", errorData);
            throw new Error(`Google token error: ${errorData.error_description || errorData.error}`);
        }

        const tokens = await tokenResponse.json();

        // Store calendar integration preferences
        const result = await updateCalendarIntegration({
            syncEnabled: true,
            token: JSON.stringify({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: Date.now() + tokens.expires_in * 1000,
                token_type: tokens.token_type,
                scope: tokens.scope,
            }),
        });

        if (!result.success) {
            throw new Error(result.error);
        }

        // Redirect back to calendar settings page
        return NextResponse.redirect(new URL("/user/settings?connected=true", request.url));
    } catch (error) {
        console.error("Google Calendar OAuth error:", error);
        return NextResponse.redirect(new URL("/user/settings?error=server_error", request.url));
    }
}
