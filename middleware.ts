import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that should not be redirected
  const isMaintenanceRoute = pathname.startsWith('/maintenance');
  const isPublicAsset = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') || 
    pathname.startsWith('/logo.svg') ||
    pathname.startsWith('/assets') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/);

  if (isMaintenanceRoute || isPublicAsset) {
    return NextResponse.next();
  }

  // Redirect all requests to the maintenance page
  return NextResponse.redirect(new URL('/maintenance', request.url));
}

export const config = {
  // Apply middleware to all routes except api, _next, and favicon
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
