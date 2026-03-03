import { NextResponse } from 'next/server'
import { createClient } from './utils/supabase/middleware'

export async function middleware(request) {
  const { supabase, response } = createClient(request)

  try {
    // Refresh session if expired
    await supabase.auth.getSession()

    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    const publicRoutes = ['/', '/login', '/sign-up', '/sign-in']
    const isPublicRoute = publicRoutes.includes(pathname)

    // Unauthenticated users
    if (!user) {
      // Allow public routes and static assets
      if (isPublicRoute) return response

      // Everything else requires login
      const redirectUrl = new URL('/Creator-dashboard', request.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Authenticated users — fetch profile 
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role, verification_status, is_verified')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Middleware: profile fetch error:', profileError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ── Creator routes (/creator/*) 
    if (pathname.startsWith('/creator')) {
      // Non-creators are not allowed here at all
      if (profile.role !== 'creator') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Creators at any verification state can access their verification portal
      if (pathname === '/creator/verify') {
        return response
      }

      // Any other /creator/* page requires approved status
      if (profile.verification_status !== 'approved') {
        return NextResponse.redirect(new URL('/creator/verify', request.url))
      }

      return response
    }

    // Admin routes (/admin/*)
    if (pathname.startsWith('/admin')) {
      if (profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return response
    }

    //Dashboard / protected routes 
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
      if (!profile.is_verified || profile.verification_status !== 'approved') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return response
    }

    // OTP verify page
    if (pathname.startsWith('/login')) {
      // Already verified users don't need to be here
      if (profile.is_verified && profile.verification_status === 'approved') {
        if (profile.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
        if (profile.role === 'creator') {
          return NextResponse.redirect(new URL('/creator/dashboard', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response
    }

    //Auth pages (login / sign-up) — redirect already-logged-in users
    if (isPublicRoute && user) {
      if (profile.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (profile.role === 'creator' && profile.verification_status === 'approved') {
        return NextResponse.redirect(new URL('/creator/dashboard', request.url))
      }
      if (profile.is_verified && profile.verification_status === 'approved') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      // Creator/viewer not yet verified → send to OTP page
      if (['/', '/login', '/sign-up', '/sign-in'].includes(pathname)) {
        if (!profile.is_verified) {
          return NextResponse.redirect(new URL('/login', request.url))
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
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}