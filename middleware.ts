import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/u', '/a', '/d', '/c'];

// This function can be marked `async` if using `await` inside
export default function middleware(request: NextRequest) {
	const token = request.cookies.get('next-auth.session-token');
	const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
	if (!token && !isAuthPage) {
		const url = request.nextUrl.clone();
		url.pathname = '/auth/login';
		const r = NextResponse.redirect(url);
		console.log('Redirecting to login page');
		console.log(r);
		return r;
	}
	const isProtected = PROTECTED_ROUTES.some((route) =>
		request.nextUrl.pathname.startsWith(route),
	);
	if (isProtected) console.log('This route is protected');
	return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: [
		'/auth/login',
		'/u/:path*',
		'/a/:path*',
		'/d/:path*',
		'/c/:path*',
	],
};
