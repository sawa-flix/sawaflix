import { NextResponse } from 'next/server'
import { createClient } from './utils/supabase/middleware'

// Resolved — absorb /landingPage from Victory, keep HEAD's verification logic

export async function middleware(request) {
  const { supabase, response } = createClient(request)
  const pathname = request.nextUrl.pathname

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const protectedRoutes = ['/dashboard', '/profile']
    const authRoutes = ['/login', '/sign-up', '/sign-in', '/', '/landingPage'] // ✅ added /landingPage from Victory
    const verifyRoute = '/verify-otp'

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.includes(pathname)
    const isVerifyPage = pathname.startsWith(verifyRoute)

    if (!user) {
      if (isProtectedRoute || isVerifyPage) {
        const redirectUrl = new URL('/login', request.url) // or '/landingPage' — decide with your team
        redirectUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    if (user) {
      let isVerified = false

      const { data: profile } = await supabase
        .from('users')
        .select('is_verified')
        .eq('id', user.id)
        .single()

      if (profile?.is_verified) isVerified = true

      if (!isVerified) {
        if (isProtectedRoute || isAuthRoute) {
          return NextResponse.redirect(new URL('/verify-otp', request.url))
        }
        if (isVerifyPage) return response
      }

      if (isVerified) {
        if (isVerifyPage || isAuthRoute) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}