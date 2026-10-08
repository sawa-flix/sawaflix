import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export default async function middleware(request: NextRequest) {
  // Skip PWA static files, logos, images, and static assets — never evaluate or redirect these
  const pathname = request.nextUrl.pathname;
  if (
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/push-sw.js' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/logos_and_pwas/') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  try {
    return await updateSession(request);
  } catch (error) {
    console.error('Middleware auth error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static, _next/image
     * - static assets, favicons, logos, icons, PWA scripts
     * - file extensions (ico, js, css, json, svg, png, jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|push-sw\\.js|icons|logos_and_pwas|login|sign-in|sign-up|verify-otp|auth/callback|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico|js|css|json|avif|woff2|woff|ttf)$).*)',
  ],
}
