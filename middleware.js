import { NextResponse } from 'next/server'
import { createClient } from './utils/supabase/middleware'

export async function middleware(request) {
  const { supabase, response } = createClient(request)

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const protectedRoutes = ['/dashboard', '/profile']
    const authRoutes = ['/login', '/sign-up', '/sign-in', '/']
    const verifyRoute = '/verify-otp' //this route is still to be created, but will be the page where users enter their OTP to verify their account
    
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.includes(pathname)
    const isVerifyPage = pathname.startsWith(verifyRoute)

//when the user is not logged in, we want to redirect them to the login page if they try to access a protected route or the verify page. We also want to allow them to access the auth routes (login, sign-up) without being redirected.
    if (!user) {
      if (isProtectedRoute || isVerifyPage) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

//when the user is looged in, we want to check if they are verified. If they are not verified, we want to redirect them to the verify page if they try to access a protected route or the auth routes. We also want to allow them to access the verify page without being redirected. If they are verified, we want to redirect them to the dashboard if they try to access the auth routes or the verify page.
    if (user) {
      let isVerified = false
      
      const { data: profile } = await supabase
        .from('users')
        .select('is_verified')
        .eq('id', user.id)
        .single()
      
      if (profile && profile.is_verified) {
        isVerified = true
      }
//users that are not verified
      if (!isVerified) {
        if (isProtectedRoute) {
          return NextResponse.redirect(new URL('/verify-otp', request.url))
        }

        if (isAuthRoute) {
          return NextResponse.redirect(new URL('/verify-otp', request.url))
        }
        // If they are already on /verify-otp, let them pass
        if (isVerifyPage) {
          return response
        }
      }

      //Verified Users
      if (isVerified) {
        if (isVerifyPage) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        if (isAuthRoute) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }

    return response

  } catch (error) {
    console.error('Middleware auth error:', error)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}