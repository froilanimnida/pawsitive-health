import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/u', '/a', '/d', '/c'];

// This function can be marked `async` if using `await` inside
export default function middleware(request: NextRequest) {
	const isProtected = PROTECTED_ROUTES.some((route) =>
		request.nextUrl.pathname.startsWith(route),
	);
	if (isProtected) console.log('This route is protected');
	return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ['/u', '/a', '/d', '/c'],
};
