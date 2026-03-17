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
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthRoute = authRoutes.includes(pathname);


    if (!user) {
      if (isPublicRoute) return response;
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, role, verification_status")
      .eq("id", user.id)
      .maybeSingle();

    const {data: creator_profile, error: creator_profileError } = await supabase
      .from("creator_profiles")
      .select("creator_id, status")
      .eq("creator_id", user.id)
      .maybeSingle();

    if (profileError) console.error("Middleware: profile fetch error:", profileError);

    if (pathname === "/creator/verify") {
      if (profile?.role === "creator" && profile?.verification_status === "approved") {
        return NextResponse.redirect(new URL("/Creator-dashboard", request.url));
      }
      return response; 
    }

    if (isAuthRoute || pathname === '/') {
      const target = profile?.role === 'creator' ? "/Creator-dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // NO PROFILE PROTECTION
    if (!profile) {
      if (isPublicRoute) return response;
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // (/creator/*)
    if (pathname.startsWith("/creator")) {
      if (profile.role !== "creator") {
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }

      if (pathname === "/creator/pending") {
        if (!creator_profile || creator_profile.status ==="unverified"){
          return NextResponse.redirect(new URL("/creator/verify", request.url))
        }
        if (creator_profile.status === "approved") {
          return NextResponse.redirect(new URL("/Creator-dashboard", request.url));
        }
        return response;
      }

      if (creator_profiles?.status !== "approved") {
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }
      return response;
    }

    // PROTECTION (/dashboard/*)
    if (pathname.startsWith("/dashboard")) {
      if (profile.role === "creator") {
        if (profile.verification_status === "approved") {
          return NextResponse.redirect(new URL("/Creator-dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }

      // Standard user must be approved
      if (profile.verification_status !== "approved") {
        return NextResponse.redirect(new URL("/verify-otp", request.url));
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