import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Missing Supabase environment variables in Middleware.');
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.getUser()
  const user = data?.user;

  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/sign-up", "/sign-in", "/verify-otp"];
  const authRoutes = ["/login", "/sign-up", "/sign-in"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Helper for redirection that preserves cookies
  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => 
      redirectResponse.cookies.set(cookie.name, cookie.value)
    );
    return redirectResponse;
  };

  // 1. Not logged in
  if (!user) {
    if (isPublicRoute || pathname === '/' || pathname === '/favicon.ico') return supabaseResponse;
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return redirectWithCookies(redirectUrl);
  }

  // 2. Fetch profile and submission data in parallel to save time (Edge timeout)
  const [profileResult, submissionResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, role, verification_status")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("verification_submissions")
      .select("status")
      .eq("creator_id", user.id)
      .maybeSingle()
  ]);

  const { data: profile, error: profileError } = profileResult;
  const { data: submission } = submissionResult;

  if (profileError) {
    console.error("Middleware: profile fetch error:", profileError);
  }

  // 3. Logged in and on auth pages (or home) -> redirect to appropriate dashboard
  if (isAuthRoute || pathname === '/') {
    const role = profile?.role || 'client';
    const isApprovedCreator = role === 'creator' || submission?.status === 'approved';
    
    let target = "/dashboard";
    if (role === 'admin') target = "/admin";
    else if (isApprovedCreator) target = "/creator-dashboard";
    
    return redirectWithCookies(new URL(target, request.url));
  }

  // 4. Reset/Missing profile safety
  if (!profile) return supabaseResponse;

  // 5. OTP Check for all users except admins
  if (profile.role !== 'admin' && profile.verification_status !== "approved") {
      if (isPublicRoute) return supabaseResponse;
      if (pathname.startsWith("/creator/verify")) return supabaseResponse;
      if (pathname.startsWith("/creator/pending")) return supabaseResponse;
      
      return redirectWithCookies(new URL("/verify-otp", request.url));
  }

  // 6. Access Control for /creator-dashboard
  if (pathname.startsWith("/creator-dashboard")) {
     const isApprovedCreator = profile.role === "creator" || submission?.status === "approved" || profile.role === 'admin';
     
     if (!isApprovedCreator) {
        return redirectWithCookies(new URL("/dashboard", request.url));
     }
  }

  // 7. Access Control for /creator/ (Verify/Pending)
  if (pathname.startsWith("/creator/")) {
     const isApprovedCreator = profile.role === "creator" || submission?.status === "approved";
     
     if (isApprovedCreator) {
       return redirectWithCookies(new URL("/creator-dashboard", request.url));
     }
     
     if (pathname === "/creator/pending") {
       if (!submission || (submission.status !== "pending" && submission.status !== "approved")) {
          return redirectWithCookies(new URL("/creator/verify", request.url));
       }
     }
  }

  return supabaseResponse;
}