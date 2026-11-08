import { createBrowserClient } from '@supabase/ssr'

export function clearSupabaseAuthCookies() {
  if (typeof document === 'undefined') return

  const cookieNames = Array.from(new Set(
    document.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const eqIndex = cookie.indexOf('=')
        return eqIndex >= 0 ? cookie.slice(0, eqIndex) : cookie
      })
      .filter((name) => /^sb-.*-auth-token(?:\.\d+)?$/.test(name))
  ))

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure;' : ''}`
  })
}

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {},
        auth: {
          lock: async (_, __, fn) => {
            return await fn()
          },
        },
      }
    )
  }

  return client
}