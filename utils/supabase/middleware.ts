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

  // Helper for redirection that preserves cookies exactly
  const redirectWithCookies = (url: URL | string) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url));
    const setCookieHeaders = supabaseResponse.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => redirectResponse.headers.append('Set-Cookie', cookie));
    return redirectResponse;
  };

  // 1. Not logged in
  if (!user) {
    if (isPublicRoute || pathname === '/' || pathname === '/favicon.ico') return supabaseResponse;
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return redirectWithCookies(redirectUrl);
  }

  // 2. Fetch profile data (Fail gracefully if Edge timeout)
  let profile = null;
  let submission = null;
  let isApprovedCreator = false;

  try {
    const { data: profileData } = await supabase
      .from("users")
      .select("id, role, verification_status")
      .eq("id", user.id)
      .maybeSingle();
      
    profile = profileData;
    
    // We only fetch verification submissions if they are a creator
    if (profile?.role === 'creator') {
        const { data: submissionData } = await supabase
          .from("verification_submissions")
          .select("status")
          .eq("creator_id", user.id)
          .maybeSingle();
        submission = submissionData;
        isApprovedCreator = (submission?.status === 'approved');
    } else {
        isApprovedCreator = (profile?.role === 'admin');
    }
  } catch (err) {
    console.error("Middleware DB Fetch issue:", err);
  }

  // 3. Logged in and on auth pages (or home) -> redirect to appropriate dashboard
  if (isAuthRoute || pathname === '/') {
    const role = profile?.role || 'client';
    
    let target = "/dashboard";
    if (role === 'admin') target = "/admin";
    else if (isApprovedCreator) target = "/creator-dashboard";
    
    return redirectWithCookies(target);
  }

  // 4. Missing profile safety
  if (!profile) return supabaseResponse;

  // 5. OTP Check for all users except admins
  if (profile.role !== 'admin' && profile.verification_status !== "approved") {
      if (isPublicRoute) return supabaseResponse;
      if (pathname.startsWith("/creator/verify")) return supabaseResponse;
      if (pathname.startsWith("/creator/pending")) return supabaseResponse;
      
      return redirectWithCookies("/verify-otp");
  }

  // 6. Access Control for /creator-dashboard
  if (pathname.startsWith("/creator-dashboard")) {
     if (!isApprovedCreator) {
        return redirectWithCookies("/dashboard");
     }
  }

  // 7. Access Control for /creator/ (Verify/Pending)
  if (pathname.startsWith("/creator/")) {
     if (isApprovedCreator) {
       return redirectWithCookies("/creator-dashboard");
     }
     
     if (pathname === "/creator/pending") {
       if (!submission || (submission.status !== "pending" && submission.status !== "approved")) {
          return redirectWithCookies("/creator/verify");
       }
     }
  }

  return supabaseResponse;
}