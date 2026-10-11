import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get locale from cookie or default to 'en'
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';

  // Add locale to headers so it's available in server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
