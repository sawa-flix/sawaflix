import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { BACKEND_URL } from '@/lib/apiConfig'

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
      return NextResponse.redirect(new URL('/dashboard?error=auth_config_missing', request.url))
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
      return redirectWithCookies('/dashboard?error=invalid_reset_link')
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
        return redirectWithCookies('/dashboard?error=auth_failed')
      }

      const user = session.user
      if (isDev) console.log('🟢 Session OK for:', user.email, '| Cookies to set:', pendingCookies.length)

      // Google returns provider_token (access_token) on every OAuth login, and
      // provider_refresh_token only when consent is (re-)granted — which we force
      // via prompt=consent on every signInWithOAuth call, so a fresh refresh token
      // is captured on every login. These are only present on this initial exchange;
      // Supabase does not resurface them on later getSession() calls, so they must
      // be persisted here or they're lost.
      const googleAccessToken = session.provider_token || null
      const googleRefreshToken = session.provider_refresh_token || null
      if (isDev) {
        console.log('🟢 Google provider tokens:', {
          access: googleAccessToken ? 'YES' : 'NO',
          refresh: googleRefreshToken ? 'YES' : 'NO',
        })
      }

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
          // Only overwrite when Google actually returned a value on this login —
          // never null out a previously stored, still-valid refresh token.
          ...(googleAccessToken ? { google_access_token: googleAccessToken } : {}),
          ...(googleRefreshToken ? { google_refresh_token: googleRefreshToken } : {}),
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

      // ── Sync Google tokens to backend (for real YouTube API calls) ─────
      // Only meaningful for Google logins — provider_token is always null on
      // email-confirmation code exchanges, so skip rather than POST garbage.
      // Never blocks the redirect: tokens are already durably saved to
      // public.users above as a fallback if this sync fails.
      if (googleAccessToken) {
        try {
          const syncController = new AbortController()
          const syncTimeout = setTimeout(() => syncController.abort(), 8000)

          const backendSyncRes = await fetch(`${BACKEND_URL}/api/auth/sync-tokens`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              session: {
                user: { id: user.id },
                provider_token: googleAccessToken,
                provider_refresh_token: googleRefreshToken,
              },
            }),
            signal: syncController.signal,
          })

          clearTimeout(syncTimeout)

          if (!backendSyncRes.ok) {
            const errText = await backendSyncRes.text().catch(() => '')
            console.error('🟡 Backend token sync warning:', backendSyncRes.status, errText)
          } else if (isDev) {
            console.log('🟢 Backend token sync OK for:', user.email)
          }
        } catch (backendSyncErr) {
          // Non-fatal — a YouTube like/comment attempt will just fail later
          // (e.g. Render cold start, transient network error). Never block
          // sign-in on this.
          console.error('🟡 Backend token sync error (non-fatal):', backendSyncErr?.message)
        }
      } else if (isDev) {
        console.log('🟡 Skipping backend token sync — no Google provider token on this exchange')
      }

      const redirectTarget = isFirstOAuthUser ? '/dashboard?welcome=oauth' : '/dashboard'
      if (isDev) console.log('🟢 Redirecting to:', redirectTarget)

      return redirectWithCookies(redirectTarget)

    } catch (exchangeErr) {
      console.error('🔴 Exchange exception:', exchangeErr)
      return redirectWithCookies('/dashboard?error=auth_failed')
    }

  } catch (topErr) {
    console.error('🔴 CALLBACK TOP-LEVEL ERROR:', topErr)
    return NextResponse.redirect(new URL('/dashboard?error=callback_error', request.url))
  }
}