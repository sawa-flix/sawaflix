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

    // 2. Fetch profiles
    // We fetch from both users and creator_profiles for maximum compatibility with merged branches
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, role, verification_status")
      .eq("id", user.id)
      .maybeSingle();

    const { data: creator_profile } = await supabase
      .from("creator_profiles")
      .select("creator_id, status")
      .eq("creator_id", user.id)
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
    // If not approved and not on the verify-otp page or exception pages, force verification
    if (profile.verification_status !== "approved") {
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
       // If already approved as creator, skip verification/pending
       if (profile.verification_status === "approved" && profile.role === "creator") {
         return NextResponse.redirect(new URL("/creator-dashboard", request.url));
       }
       
       // Handle specific paths
       if (pathname === "/creator/pending") {
         // If they have no submission or unverified, go to verify
         if (!creator_profile || creator_profile.status === "unverified") {
            return NextResponse.redirect(new URL("/creator/verify", request.url));
         }
         return response;
       }
       
       return response;
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