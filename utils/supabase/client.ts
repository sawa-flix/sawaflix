export function createClient() {
  if (typeof window === 'undefined') {
    throw new Error('createClient() must be called from the browser')
  }

  // Dynamically require the browser entry so server/middleware bundles
  // don't try to resolve '@supabase/supabase-js'. This keeps the module
  // out of the server graph and prevents Next middleware compilation errors.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createBrowserClient } = require('@supabase/ssr')

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}