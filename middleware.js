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

<<<<<<< HEAD
      // Creators at any verification state can access their verification portal
      if (pathname === "/creator/verify") {
        if (profile.verification_status === "pending") {
          return NextResponse.redirect(
            new URL("/creator/verify", request.url),
          );
        }
        if (profile.verification_status === "approved") {
          return NextResponse.redirect(
            new URL("/creator-dashboard", request.url),
          );
        }
        return response;
      }

      // /creator/pending access
      if (pathname === "/creator/pending") {
        if (profile.verification_status === "approved") {
          return NextResponse.redirect(
            new URL("/creator-dashboard", request.url),
          );
        }
        if (profile.verification_status === "unverified") {
          return NextResponse.redirect(new URL("/creator/verify", request.url));
=======
      if (pathname === "/creator/pending") {
        if (profile.verification_status === "approved") {
          return NextResponse.redirect(new URL("/Creator-dashboard", request.url));
>>>>>>> cccdeafc400138dfe75fa71febd7eb9c4decea98
        }
        return response;
      }

      if (profile.verification_status !== "approved") {
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }
      return response;
    }

    // PROTECTION (/dashboard/*)
    if (pathname.startsWith("/dashboard")) {
      if (profile.role === "creator") {
        if (profile.verification_status === "approved") {
<<<<<<< HEAD
          return NextResponse.redirect(
            new URL("/creator-dashboard", request.url),
          );
=======
          return NextResponse.redirect(new URL("/Creator-dashboard", request.url));
>>>>>>> cccdeafc400138dfe75fa71febd7eb9c4decea98
        }
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }

      // Standard user must be approved
      if (profile.verification_status !== "approved") {
        return NextResponse.redirect(new URL("/verify-otp", request.url));
      }
      return response;
    }

<<<<<<< HEAD
    // Auth pages (login / sign-up) — allow viewing even if logged in
    if (isAuthRoute) {
      return response;
    }

    // OTP verification page — redirect already verified users
    if (pathname === "/verify-otp") {
      if (profile.verification_status === "approved") {
        if (profile.role === "creator") {
          return NextResponse.redirect(
            new URL("/creator-dashboard", request.url),
          );
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return response;
    }

=======
>>>>>>> cccdeafc400138dfe75fa71febd7eb9c4decea98
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return response;
  }
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};