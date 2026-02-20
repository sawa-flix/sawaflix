// app/(auth)/auth/callback/route.js
import { createClient } from '../../../../utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type')

    console.log('🔵 CALLBACK RECEIVED:', {
      code: code ? `YES (${code.substring(0, 8)}...)` : 'NO',
      type: type || 'none',
      fullUrl: requestUrl.toString()
    })

    // STEP 1: If there's NO code at all, it's invalid
    if (!code) {
      console.log('🔴 No code parameter - invalid callback')
      return NextResponse.redirect(new URL('/login?error=invalid_reset_link', request.url))
    }

    // STEP 2: ALWAYS treat password reset links specially
    const isPasswordReset =
      type === 'recovery' ||
      requestUrl.searchParams.has('token_hash') ||
      requestUrl.searchParams.has('recovery') ||
      code.includes('reset') ||
      code.includes('recovery') ||
      requestUrl.searchParams.toString().includes('recovery') ||
      requestUrl.searchParams.toString().includes('reset')

    if (isPasswordReset) {
      console.log('🟡 PASSWORD RESET DETECTED - Redirecting to /update-password')

      const redirectUrl = new URL('/update-password', request.url)
      requestUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
      })

      console.log('🟡 Redirect URL:', redirectUrl.toString())
      return NextResponse.redirect(redirectUrl)
    }

    // STEP 3: Code without type — assume password reset
    if (code && !type) {
      console.log('🟡 CODE WITHOUT TYPE - Assuming password reset')

      const redirectUrl = new URL('/update-password', request.url)
      redirectUrl.searchParams.set('code', code)

      console.log('🟡 Redirect URL:', redirectUrl.toString())
      return NextResponse.redirect(redirectUrl)
    }

    // STEP 4: Regular OAuth/sign-in flows (has type but not recovery)
    if (code && type && type !== 'recovery') {
      console.log('🟢 REGULAR AUTH FLOW - Exchanging code')
      const supabase = await createClient()

      try {
        const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('🔴 Exchange failed:', exchangeError.message)
          const redirectUrl = new URL('/update-password', request.url)
          redirectUrl.searchParams.set('code', code)
          redirectUrl.searchParams.set('error', 'expired_link')
          return NextResponse.redirect(redirectUrl)
        }

        // After successful auth, sync user to public.users table
        try {
          if (session) {
            const user = session.user
            const googleToken = session.provider_token
            const googleRefreshToken = session.provider_refresh_token

            console.log('🟡 Syncing user and YouTube token to users table')

            const { error: syncError } = await supabase
              .from('users')
              .upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.username || user.email || 'Anonymous',
                google_access_token: googleToken,
                google_refresh_token: googleRefreshToken,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' })

            if (syncError) console.error('🟡 Token sync warning:', syncError.message)

            // ── Creator Role Check ─────────────────────────────────────────────────
            // New creators who haven't selected a role yet are sent to /select-role.
            // Returning creators who already have a role go straight to /dashboard.
            const { data: creatorProfile } = await supabase
              .from('users')
              .select('creator_type')
              .eq('id', user.id)
              .single()

            if (!creatorProfile?.creator_type) {
              console.log('🟡 New creator (no role yet) — redirecting to /select-role')
              return NextResponse.redirect(new URL('/select-role', request.url))
            }
          }
        } catch (syncErr) {
          console.error('🟡 User sync error (non-fatal):', syncErr.message)
          // Don't fail the auth flow if sync fails
        }

        console.log('🟢 Auth successful, redirecting to /dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))

      } catch (exchangeErr) {
        console.error('🔴 Exchange error:', exchangeErr)
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
      }
    }

    // STEP 5: Fallback - send to update-password
    console.log('🟡 FALLBACK - Sending to update-password')
    const redirectUrl = new URL('/update-password', request.url)
    requestUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('🔴 CALLBACK ERROR:', error)
    return NextResponse.redirect(
      new URL(`/login?error=callback_error&details=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}