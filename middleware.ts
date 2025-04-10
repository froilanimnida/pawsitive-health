import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
    const PROTECTED_ROUTES = ["/u", "/a", "/d", "/c", "/v"];
    const environment = process.env.ENVIRONMENT || "production";
    const cookieName = environment === "development" ? "next-auth.session-token" : "__Secure-next-auth.session-token";
    const token = request.cookies.get(cookieName);
    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

    if (!token && !isAuthPage) {
        const url = request.nextUrl.clone();
        const returnTo = request.nextUrl.pathname + request.nextUrl.search;
        url.pathname = "/auth/login";
        url.searchParams.set("next", returnTo);
        return NextResponse.redirect(url);
    }

    const isProtected = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));
    console.log(isProtected);

    return NextResponse.next();
}

export const config = {
    matcher: ["/u/:path*", "/a/:path*", "/d/:path*", "/c/:path*", "/v/:path*"],
};
