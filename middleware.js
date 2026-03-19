import { NextResponse } from "next/server";
import { createClient } from "./utils/supabase/middleware";

export async function middleware(request) {
  const { supabase, response } = createClient(request);

  try {
    await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    const publicRoutes = ["/login", "/sign-up", "/sign-in", "/verify-otp"];
    const authRoutes = ["/login", "/sign-up", "/sign-in"];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // 1. Not logged in
    if (!user) {
      if (isPublicRoute || pathname === '/') return response;
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, role, verification_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) console.error("Middleware: profile fetch error:", profileError);

    // 3. Logged in and on auth pages (or home) -> redirect to appropriate dashboard
    if (isAuthRoute || pathname === '/') {
      const target = profile?.role === 'creator' ? "/creator-dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // 4. Missing profile safety
    if (!profile) return response;

    // 5. OTP Check for all users
    // If not approved and not on the verify-otp page or public routes, force verification
    if (profile.verification_status !== "approved") {
        // Exceptions for public routes or verification pages
        if (isPublicRoute) return response;
        if (pathname.startsWith("/creator/verify")) return response;
        if (pathname.startsWith("/creator/pending")) return response;
        
        return NextResponse.redirect(new URL("/verify-otp", request.url));
    }

    // 6. Access Control for /creator-dashboard
    if (pathname.startsWith("/creator-dashboard")) {
       if (profile.role !== "creator" || profile.verification_status !== "approved") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
       }
    }

    // 7. Access Control for /creator/ (Verify/Pending)
    if (pathname.startsWith("/creator/")) {
       if (pathname === "/creator/verify" && profile.verification_status === "approved") {
          return NextResponse.redirect(new URL("/creator-dashboard", request.url));
       }
       if (pathname === "/creator/pending" && profile.verification_status === "approved") {
          return NextResponse.redirect(new URL("/creator-dashboard", request.url));
       }
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return response;
  }
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};