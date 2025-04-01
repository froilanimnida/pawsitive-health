import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
    const PROTECTED_ROUTES = ["/u", "/a", "/d", "/c"];
    const token = request.cookies.get("__Secure-next-auth.session-token");
    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
    console.log("Token:", token);
    console.log("Request URL:", request.nextUrl.pathname);
    if (!token && !isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }
    const isProtected = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));
    if (isProtected) console.log("This route is protected");
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/u/:path*", "/a/:path*", "/d/:path*", "/c/:path*"],
};
