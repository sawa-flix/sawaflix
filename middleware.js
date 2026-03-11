import { NextResponse } from "next/server";
import { createClient } from "./utils/supabase/middleware";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client bypasses Row Level Security (RLS) for profile lookups
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function middleware(request) {
  const { supabase, response } = createClient(request);

  try {
    // Refresh session if expired
    await supabase.auth.getSession();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    const publicRoutes = ["/", "/login", "/sign-up", "/sign-in", "/verify-otp"];
    const authRoutes = ["/login", "/sign-up", "/sign-in"];
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthRoute = authRoutes.includes(pathname);

    // Unauthenticated users
    if (!user) {
      // Allow public routes and static assets
      if (isPublicRoute) return response;

      // Everything else requires login
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Authenticated users — fetch profile using admin client to bypass RLS
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("users")
      .select("id, role, verification_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Middleware: profile fetch error:", profileError);
    }

    if (!profile) {
      // If no profile exists, only redirect if NOT already on a public/auth route
      if (isPublicRoute || isAuthRoute) {
        return response;
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const isVerified = profile.verification_status === "approved";
    const isCreator = profile.role === "creator";
    const isAdmin = profile.role === "admin";

    // ── OTP verification page
    if (pathname === "/verify-otp") {
      // Already verified? Skip OTP and send to the right dashboard
      if (isVerified) {
        if (isCreator) {
          return NextResponse.redirect(
            new URL("/Creator-dashboard", request.url),
          );
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // Not verified yet — allow them to stay on OTP page
      return response;
    }

    // ── Auth pages (login / sign-up)
    if (isAuthRoute) {
      // Let logged-in users visit auth pages without forced redirect
      return response;
    }

    // ── Admin routes (/admin/*)
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return response;
    }

    // ── Creator routes (/creator/*)
    if (pathname.startsWith("/creator")) {
      // Non-creators are not allowed here at all
      if (!isCreator) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (pathname === "/creator/verify") {
        if (profile.verification_status === "pending") {
          return NextResponse.redirect(
            new URL("/creator/pending", request.url),
          );
        }
        if (isVerified) {
          return NextResponse.redirect(
            new URL("/Creator-dashboard", request.url),
          );
        }
        return response;
      }

      if (pathname === "/creator/pending") {
        if (isVerified) {
          return NextResponse.redirect(
            new URL("/Creator-dashboard", request.url),
          );
        }
        if (profile.verification_status === "unverified") {
          return NextResponse.redirect(new URL("/creator/verify", request.url));
        }
        return response;
      }

      // Any other /creator/* page requires approved status
      if (!isVerified) {
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }

      return response;
    }

    // ── Creator Dashboard (/Creator-dashboard/*)
    if (pathname.startsWith("/Creator-dashboard")) {
      if (!isCreator || !isVerified) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return response;
    }

    // ── Viewer Dashboard and profile (/dashboard/*, /profile/*)
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
      if (isCreator) {
        // Creators should be in their own dashboard
        if (profile.verification_status === "pending") {
          return NextResponse.redirect(
            new URL("/creator/pending", request.url),
          );
        }
        if (isVerified) {
          return NextResponse.redirect(
            new URL("/Creator-dashboard", request.url),
          );
        }
        return NextResponse.redirect(new URL("/creator/verify", request.url));
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
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
