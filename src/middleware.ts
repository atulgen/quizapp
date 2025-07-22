// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login'];
  
  // Create response first
  let response: NextResponse;
  
  if (publicRoutes.includes(pathname)) {
    response = NextResponse.next();
  }
  // Check for admin routes
  else if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      response = NextResponse.redirect(new URL('/login', request.url));
    } else {
      try {
        await jwtVerify(token, secret);
        response = NextResponse.next();
      } catch (error) {
        // Token is invalid, redirect to login
        response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('admin-token');
      }
    }
  } else {
    response = NextResponse.next();
  }

  // Add pathname to headers for LayoutProvider (only for successful requests)
  if (response.status === 200 || !response.headers.get('location')) {
    response.headers.set('x-pathname', pathname);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};