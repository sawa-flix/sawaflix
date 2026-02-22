// Resolved — absorb /landingPage from Victory, keep HEAD's verification logic

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