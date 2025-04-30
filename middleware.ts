import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
    const PROTECTED_ROUTES = ["/user", "/admin", "/d", "/clinic", "/vet"];

    // Use getToken instead of accessing cookies directly for better compatibility
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthPage =
        request.nextUrl.pathname.startsWith("/auth") ||
        request.nextUrl.pathname.startsWith("/signin") ||
        request.nextUrl.pathname.startsWith("/signup");

    const headers: Headers = new Headers(request.headers);
    headers.set("x-pathname", request.nextUrl.pathname);

    // Check for token and handle authentication
    if (!token && !isAuthPage) {
        const url = request.nextUrl.clone();
        const returnTo = request.nextUrl.pathname + request.nextUrl.search;
        url.pathname = "/signin";
        url.searchParams.set("next", returnTo);
        return NextResponse.redirect(url);
    }

    const isProtected = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

    // Role-based access control can be implemented here using token claims
    if (isProtected && token) {
        const userRole = token.role;
        if (!userRole) {
            const url = request.nextUrl.clone();
            url.pathname = "/signin";
            return NextResponse.redirect(url);
        }
        // check if the role doesn't match in the url pathname
        const isAdmin = request.nextUrl.pathname.startsWith("/admin");
        const isVet = request.nextUrl.pathname.startsWith("/vet");
        const isClinic = request.nextUrl.pathname.startsWith("/clinic");
        const isUser = request.nextUrl.pathname.startsWith("/user");
        const isVetRole = userRole === "veterinarian" || userRole === "admin";
        const isClinicRole = userRole === "client" || userRole === "admin";
        const isUserRole = userRole === "user" || userRole === "admin";
        const isAdminRole = userRole === "admin";
        if (
            (isAdmin && !isAdminRole) ||
            (isVet && !isVetRole) ||
            (isClinic && !isClinicRole) ||
            (isUser && !isUserRole)
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/signin";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next({
        request: {
            headers: headers,
        },
    });
}

export const config = {
    matcher: ["/user/:path*", "/admin/:path*", "/d/:path*", "/clinic/:path*", "/vet/:path*"],
};
