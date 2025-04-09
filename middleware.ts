import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
    const PROTECTED_ROUTES = ["/u", "/a", "/d", "/c"];
    const environment = process.env.ENVIRONMENT || "production";
    const cookieName = environment === "development" ? "next-auth.session-token" : "__Secure-next-auth.session-token";
    const token = request.cookies.get(cookieName);
    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
    if (!token && !isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }

    const isProtected = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));
    console.log(request.url);
    if (isProtected) console.log("This route is protected");

    return NextResponse.next({
        request: {
            headers: {
                ...request.headers,
                "x-pathname": request.nextUrl.pathname,
            }
        },
    });
}

export const config = {
    matcher: ["/u/:path*", "/a/:path*", "/d/:path*", "/c/:path*"],
};
