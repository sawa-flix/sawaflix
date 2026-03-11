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

    const publicRoutes = ["/", "/login", "/sign-up"];
    const authRoutes = ["/login", "/sign-up"];
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthRoute = authRoutes.includes(pathname);

    // Unauthenticated users
    if (!user) {
      if (isPublicRoute) return response;
      
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
      if (isPublicRoute || isAuthRoute) {
        return response;
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const isCreator = profile.role === "creator";
    const isAdmin = profile.role === "admin";
    const status = profile.verification_status || "unverified";
    const isApproved = status === "approved";
    const isPending = status === "pending";

    // ── Admin routes (/admin/*)
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return response;
    }

    // ── Landing Page
    if (pathname === "/") {
      return response; // Allow authenticated users to see the landing page
    }

    // ── Auth Pages
    if (isAuthRoute) {
      return response;
    }

    // ── CREATOR ROUTING LOGIC
    if (isCreator) {
      // 1. Creators must NOT access standard dashboard
      if (pathname.startsWith("/dashboard")) {
        if (isApproved) return NextResponse.redirect(new URL("/creator-dashboard", request.url));
        if (isPending) return NextResponse.redirect(new URL("/creator/pending", request.url));
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }

      // 2. Creator Dashboard access
      if (pathname.startsWith("/creator-dashboard") || pathname === "/creator") {
        if (isApproved) return response;
        if (isPending) return NextResponse.redirect(new URL("/creator/pending", request.url));
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }

      // 3. Creator Verification Pages
      if (pathname === "/creator/verify") {
        if (isApproved) return NextResponse.redirect(new URL("/creator-dashboard", request.url));
        if (isPending) return NextResponse.redirect(new URL("/creator/pending", request.url));
        return response; // Allow unverified creators to see verify
      }

      if (pathname === "/creator/pending") {
        if (isApproved) return NextResponse.redirect(new URL("/creator-dashboard", request.url));
        if (status === "unverified") return NextResponse.redirect(new URL("/creator/verify", request.url));
        return response; // Allow pending creators to see pending
      }
    }

    // ── STANDARD USER (NON-CREATOR) ROUTING LOGIC
    if (!isCreator && !isAdmin) {
      // 1. Users must NOT access creator dashboard or creator verification pages
      if (pathname.startsWith("/creator-dashboard") || pathname.startsWith("/creator")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // 2. Dashboard access
      if (pathname.startsWith("/dashboard")) {
        return response; // Allow users to see the dashboard
      }
      
      // Keep them away from verify-otp unless specifically allowed (if needed, omitting strict block here depending on app flow)

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
