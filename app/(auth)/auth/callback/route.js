import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const isDev = process.env.NODE_ENV === 'development'
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (isDev) {
      console.log('🔵 CALLBACK RECEIVED:', {
        code: code ? 'YES' : 'NO',
        type: type || 'none',
      })
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/login?error=auth_config_missing', request.url))
    }

    const cookieStore = await cookies()

    // pendingCookies collects every Set-Cookie call made during this request
    // (including session cookies written by exchangeCodeForSession)
    // We replay them on the final redirect response so the browser receives them.
    const pendingCookies = []

    // @supabase/ssr v0.1.x uses get/set/remove (not getAll/setAll)
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          // Capture for the redirect response
          pendingCookies.push({ name, value, options })
          // Also write to the request cookie store (makes subsequent reads see the value)
          try { cookieStore.set({ name, value, ...options }) } catch (_) { /* ok in route handler */ }
        },
        remove(name, options) {
          pendingCookies.push({ name, value: '', options })
          try { cookieStore.delete({ name, ...options }) } catch (_) { /* ok in route handler */ }
        },
      },
    })

    // Apply all captured cookies onto any response
    const applyPendingCookies = (response) => {
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          path: options?.path ?? '/',
          sameSite: options?.sameSite ?? 'lax',
          secure: options?.secure ?? (process.env.NODE_ENV === 'production'),
          httpOnly: options?.httpOnly ?? true,
        })
      })
      return response
    }

    const redirectWithCookies = (target) => {
      const targetUrl = new URL(target, request.url)
      return applyPendingCookies(NextResponse.redirect(targetUrl))
    }

    // ── STEP 1: Require a code ─────────────────────────────────────────────
    if (!code) {
      if (isDev) console.log('🔴 No code in callback URL')
      return redirectWithCookies('/login?error=invalid_reset_link')
    }

    // ── STEP 2: Password reset → /update-password ──────────────────────────
    if (type === 'recovery') {
      if (isDev) console.log('🟡 Recovery type detected — redirecting to /update-password')
      const redirectUrl = new URL('/update-password', request.url)
      requestUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
      })
      return redirectWithCookies(redirectUrl.toString())
    }

    // ── STEP 3: OAuth / email confirmation code exchange ───────────────────
    if (isDev) console.log('🟢 Exchanging code for session...')

    try {
      // This triggers set() above for each session cookie → they go into pendingCookies
      const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError || !session?.user) {
        console.error('🔴 Exchange failed:', exchangeError?.message || 'No session')
        return redirectWithCookies('/login?error=auth_failed')
      }

      const user = session.user
      if (isDev) console.log('🟢 Session OK for:', user.email, '| Cookies to set:', pendingCookies.length)

      // ── Sync profile to public.users ────────────────────────────────────
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
          // Google sends display name as full_name or name
          username: user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.user_metadata?.username
            || user.email?.split('@')[0]
            || 'User',
          role: platformRole === 'creator' ? 'creator' : 'viewer',
          platform_role: platformRole === 'creator' ? 'artist' : 'client',
          // Google avatar is in avatar_url or picture
          profile_image_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          verification_status: 'approved', // OAuth = already verified
          updated_at: new Date().toISOString(),
        }

        if (supabaseServiceRoleKey) {
          // Use service role to bypass RLS
          const supabaseAdmin = createServerClient(supabaseUrl, supabaseServiceRoleKey, {
            cookies: {
              get() { return undefined },
              set() {},
              remove() {},
            },
          })
          const { error: syncError } = await supabaseAdmin
            .from('users')
            .upsert(payload, { onConflict: 'id' })

          if (syncError) {
            console.error('🟡 User sync warning (Admin):', syncError.message)
          } else if (isDev) {
            console.log('🟢 Profile synced for:', user.email)
          }
        } else {
          const { error: syncError } = await supabase
            .from('users')
            .upsert(payload, { onConflict: 'id' })
          if (syncError) console.error('🟡 User sync warning (Anon):', syncError.message)
        }
      } catch (syncErr) {
        // Non-fatal — user can continue even if profile sync has an issue
        console.error('🟡 Profile sync error (non-fatal):', syncErr?.message)
      }

      const redirectTarget = isFirstOAuthUser ? '/dashboard?welcome=oauth' : '/dashboard'
      if (isDev) console.log('🟢 Redirecting to:', redirectTarget)

      return redirectWithCookies(redirectTarget)

    } catch (exchangeErr) {
      console.error('🔴 Exchange exception:', exchangeErr)
      return redirectWithCookies('/login?error=auth_failed')
    }

  } catch (topErr) {
    console.error('🔴 CALLBACK TOP-LEVEL ERROR:', topErr)
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url))
  }
}