// app/auth/callback/route.js - SIMPLIFIED VERSION
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { copySetCookies } from '../../../../utils/supabase/cookies'

export async function GET(request) {
  try {
    const isDev = process.env.NODE_ENV === 'development'
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (isDev) {
      console.log('🔵 CALLBACK RECEIVED:', {
        code: code ? 'YES' : 'NO',
        type: type || 'none',
        pathname: requestUrl.pathname
      })
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/login?error=auth_config_missing', request.url))
    }

    let supabaseResponse = NextResponse.next({
      request: { headers: request.headers },
    })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    const redirectWithCookies = (target) => {
      const targetUrl = new URL(target, request.url)
      const redirectResponse = NextResponse.redirect(targetUrl)
      copySetCookies(supabaseResponse, redirectResponse)
      return redirectResponse
    }

    // STEP 1: If there's NO code at all, it's invalid
    if (!code) {
      if (isDev) console.log('🔴 No code parameter - invalid callback')
      return redirectWithCookies('/login?error=invalid_reset_link')
    }

    // STEP 2: Route password recovery links to update-password.
    // OAuth provider callbacks are handled in STEP 3.
    const isPasswordReset = type === 'recovery'

    if (isPasswordReset) {
      if (isDev) console.log('🟡 PASSWORD RESET DETECTED - Redirecting to /update-password')

      const redirectUrl = new URL('/update-password', request.url)

      // Copy EVERYTHING from the original URL
      requestUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
      })

      if (isDev) console.log('🟡 Redirect URL:', redirectUrl.toString())
      return redirectWithCookies(redirectUrl.toString())
    }

    // STEP 3: Regular OAuth / auth callback flow.
    if (isDev) console.log('🟢 AUTH CALLBACK - Exchanging code for session')

    try {
      const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError || !session?.user) {
        console.error('🔴 Exchange failed:', exchangeError?.message || 'No session user after exchange')
        return redirectWithCookies('/login?error=auth_failed')
      }

      const user = session.user

      // First-time OAuth users may not yet have a public.users row. We upsert to support both.
      let isFirstOAuthUser = false
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        isFirstOAuthUser = !existingUser

        const platformRole = user.user_metadata?.category || user.user_metadata?.role || 'client'

        const payload = {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.full_name || user.user_metadata?.username || user.email || 'Anonymous',
          role: platformRole === 'creator' ? 'creator' : 'viewer',
          platform_role: platformRole === 'creator' ? 'artist' : 'client',
          profile_image_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        }

        const { error: syncError } = await supabase
          .from('users')
          .upsert(payload, { onConflict: 'id' })

        if (syncError) console.error('🟡 User sync warning:', syncError.message)
      } catch (syncErr) {
        console.error('🟡 User sync error (non-fatal):', syncErr.message)
      }

      const redirectTarget = isFirstOAuthUser ? '/dashboard?welcome=oauth' : '/dashboard'
      if (isDev) console.log('🟢 Auth successful, redirecting to', redirectTarget)
      return redirectWithCookies(redirectTarget)
    } catch (exchangeErr) {
      console.error('🔴 Exchange error:', exchangeErr)
      return redirectWithCookies('/login?error=auth_failed')
    }

  } catch (error) {
    console.error('🔴 CALLBACK ERROR:', error)
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url))
  }
}