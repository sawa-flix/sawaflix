# ⚡ Sprint 1 Code Review - Quick Fix Snippets

**For:** Wohking & Ngam  
**Use:** Copy-paste these directly into your code  
**Time to Implement:** 3-4 hours total  

---

## 🔧 WOHKING - File Upload Fixes

### FIX #1: Add File Size Validation

**Location:** `app/api/upload/route.ts` - Add at top of file

```typescript
// Add these constants after imports
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MIN_FILE_SIZE = 1 * 1024; // 1KB (reject empty files)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
];

// Add validation helper function
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit. Reduce and try again.`,
    };
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      valid: false,
      error: 'File is too small. Minimum 1KB required.',
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}
```

**Location:** `app/api/upload/route.ts` - In POST handler after file retrieval

```typescript
// Replace existing validation with this:
const formData = await req.formData();
const file = formData.get("file") as File | null;
const categoryInput = formData.get("category");

// ✨ ADD THIS: File validation
if (!file) {
  return NextResponse.json(
    { error: "File is required" },
    { status: 400 }
  );
}

const fileValidation = validateFile(file);
if (!fileValidation.valid) {
  return NextResponse.json(
    { error: fileValidation.error },
    { status: 400 }
  );
}

// Continue with existing category validation
const validation = UploadSchema.safeParse({ category: categoryInput });
if (!validation.success) {
  return NextResponse.json(
    { error: "Invalid category" },
    { status: 400 }
  );
}
```

---

### FIX #2: Add Upload Rate Limiting

**Location:** `lib/redis.ts` - Update rate limiters

```typescript
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ✨ ADD THESE: Separate rate limiters for different operations
export const uploadRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 uploads per hour
});

export const otpSendRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 OTP sends per 15 min
});

export const otpVerifyRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 verify attempts per hour
});

// Keep this for backward compatibility
export const rateLimit = uploadRateLimit;
```

**Location:** `app/api/upload/route.ts` - Add rate limit check in POST handler

```typescript
// Add after authentication check (around line 45-50)
if (!isServiceRole) {
  // Rate limit check
  const { success } = await uploadRateLimit.limit(`upload:${creator_id}`);
  if (!success) {
    return NextResponse.json(
      {
        error: "Upload limit exceeded. Maximum 10 uploads per hour.",
        retryAfter: 3600,
      },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }
}
```

---

### FIX #3: Add Upload Error Logging

**Location:** `app/api/upload/route.ts` - Add logging function

```typescript
// Add this helper function at module level
async function logUploadEvent(
  creator_id: string,
  status: "success" | "failed",
  data: {
    category?: string;
    filename?: string;
    file_size?: number;
    error?: string;
    ip?: string;
  }
) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await adminClient.from("upload_logs").insert({
      creator_id,
      status,
      category: data.category,
      file_name: data.filename,
      file_size: data.file_size,
      error_message: data.error,
      ip_address: data.ip,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[LOGGING ERROR] Failed to log upload:", err);
    // Don't throw - logging failure shouldn't break upload
  }
}
```

**Location:** `app/api/upload/route.ts` - Add logging in POST handler

```typescript
// On successful upload - around line 65
if (uploadError) throw uploadError;

// ✨ ADD THIS:
await logUploadEvent(creator_id, "success", {
  category: validation.data.category,
  filename: fileName,
  file_size: file.size,
  ip: req.headers.get("x-forwarded-for") || "unknown",
});

return NextResponse.json({
  message: "Success!",
  storagePath: data.path,
});
```

```typescript
// In catch block - around line 75
} catch (err: any) {
  // ✨ ADD THIS:
  await logUploadEvent(creator_id, "failed", {
    category: validation?.data?.category,
    error: err.message,
    ip: req.headers.get("x-forwarded-for") || "unknown",
  });

  console.error("Upload error:", {
    message: err.message,
    code: err.code,
    timestamp: new Date().toISOString(),
  });
  
  return NextResponse.json(
    { error: "Upload failed. Please try again." },
    { status: 500 }
  );
}
```

---

### FIX #4: Add Safe Logging Utility

**Location:** `lib/logging.ts` (new file)

```typescript
export function safeLog(
  level: "info" | "warn" | "error",
  message: string,
  data?: any
) {
  const isDev = process.env.NODE_ENV === "development";

  const timestamp = new Date().toISOString();
  const logPrefix = `[${level.toUpperCase()}] ${timestamp}`;

  if (isDev) {
    // Full logging in development
    console[level](`${logPrefix} ${message}`, data);
  } else {
    // Limited logging in production
    if (level === "error") {
      console.error(`${logPrefix} ${message}`);
      // Don't log sensitive data
    } else if (level === "warn") {
      console.warn(`${logPrefix} ${message}`);
    }
    // Skip info in production
  }
}

// Usage example:
// safeLog("info", "File upload started", { filename: "doc.pdf" });
// safeLog("error", "Upload failed", { message: err.message });
```

---

## 🔐 NGAM - Auth & OTP Fixes

### FIX #5: Implement Email OTP Sending

**Location:** `app/api/otp/send/route.ts` - REPLACE ENTIRE FILE

```typescript
import { NextResponse } from "next/server";
import { otpSendRateLimit } from "@/lib/redis";

// ✨ ADD SendGrid setup
import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toString().trim().toLowerCase();

    // Rate limiting
    const { success } = await otpSendRateLimit.limit(
      `otp_send:${normalizedEmail}`
    );
    if (!success) {
      return NextResponse.json(
        {
          error: "Too many OTP requests. Please try again in 15 minutes.",
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis with 5-minute expiration
    const { redis } = await import("@/lib/redis");
    await redis.set(`otp:${normalizedEmail}`, otp, { ex: 300 });

    // ✨ SEND EMAIL via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: normalizedEmail,
          from: process.env.SENDGRID_FROM_EMAIL || "noreply@sawaflix.com",
          subject: "🔐 Your SawaFlix Verification Code",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
                  .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .logo { font-size: 24px; font-weight: bold; color: #FF6B35; }
                  .content { text-align: center; }
                  .otp-box { 
                    background: #f0f0f0; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    color: #FF6B35;
                    font-family: 'Courier New', monospace;
                  }
                  .footer { color: #999; font-size: 12px; margin-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">🎬 SawaFlix</div>
                  </div>
                  <div class="content">
                    <h2>Email Verification</h2>
                    <p>Your verification code is:</p>
                    <div class="otp-box">${otp}</div>
                    <p style="color: #666; font-size: 14px;">
                      This code expires in <strong>5 minutes</strong>.
                    </p>
                    <p style="color: #999; font-size: 13px;">
                      Don't share this code with anyone. SawaFlix will never ask for this code.
                    </p>
                  </div>
                  <div class="footer">
                    <p>© 2026 SawaFlix. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("[SendGrid Error]", emailError);
        // Don't fail - fall back to console logging for development
      }
    } else {
      // Development fallback
      console.log(`[DEV MODE] OTP for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json({
      message: "OTP sent to your email successfully",
      expiresIn: 300, // seconds
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      // Only expose OTP in development
      debug: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("[OTP Send Error]", error);

    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
```

**Environment Variables Needed (Add to `.env.local`):**
```
SENDGRID_API_KEY=sg_your_api_key_here
SENDGRID_FROM_EMAIL=verify@sawaflix.com
```

---

### FIX #6: Add Rate Limiting to OTP Verify

**Location:** `app/api/otp/verify/route.ts` - REPLACE ENTIRE FILE

```typescript
import { NextResponse } from "next/server";
import { redis, otpVerifyRateLimit } from "@/lib/redis";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toString().trim().toLowerCase();

    // ✨ ADD RATE LIMITING
    const { success } = await otpVerifyRateLimit.limit(
      `otp_verify:${normalizedEmail}`
    );
    if (!success) {
      return NextResponse.json(
        {
          error: "Too many verification attempts. Try again in 1 hour.",
        },
        { status: 429 }
      );
    }

    // Get stored OTP
    const storedOtp = await redis.get(`otp:${normalizedEmail}`);

    if (!storedOtp) {
      return NextResponse.json(
        {
          error: "OTP expired or not found. Request a new code.",
        },
        { status: 400 }
      );
    }

    // Compare OTP
    if (String(storedOtp).trim() !== String(code).trim()) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // ✨ DELETE OTP after successful verification
    await redis.del(`otp:${normalizedEmail}`);

    // Update user verification status
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        is_verified: true,
        verification_status: "approved", // ✨ Update status
      })
      .eq("email", normalizedEmail);

    if (error) {
      console.error("[DB Error]", error);
      return NextResponse.json(
        { error: "Verification update failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User verified successfully",
      verified: true,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("[OTP Verify Error]", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
```

---

### FIX #7: Update Middleware for Role-Based Access

**Location:** `middleware.js` - REPLACE ENTIRE FILE

```javascript
import { NextResponse } from "next/server";
import { createClient } from "./utils/supabase/middleware";

export async function middleware(request) {
  const { supabase, response } = createClient(request);
  const { pathname } = request.nextUrl;

  try {
    // Refresh session if expired
    await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    // Public routes - no auth needed
    const publicRoutes = ["/", "/login", "/sign-up", "/sign-in"];

    // ============================================
    // Case 1: User NOT logged in
    // ============================================
    if (!user) {
      // Allow public routes
      if (publicRoutes.includes(pathname)) {
        return response;
      }

      // Redirect to login with return URL
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // ============================================
    // Case 2: User IS logged in - fetch profile
    // ============================================
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, verification_status, is_verified")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ✨ Route Protection Logic
    // Creator routes - must be creator with verification
    if (pathname.startsWith("/creator")) {
      if (profile.role !== "creator") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Allow verification portal at any status
      if (pathname === "/creator/verify") {
        return response;
      }

      // Require approval for full creator dashboard
      if (
        pathname.startsWith("/creator/dashboard") &&
        profile.verification_status !== "approved"
      ) {
        return NextResponse.redirect(new URL("/creator/verify", request.url));
      }
    }

    // Admin routes - must be admin
    if (pathname.startsWith("/admin")) {
      if (profile.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return response;
    }

    // General dashboard - must be verified
    if (pathname.startsWith("/dashboard")) {
      if (!profile.is_verified) {
        return NextResponse.redirect(new URL("/verify-otp", request.url));
      }
    }

    // ============================================
    // Case 3: Redirect verified users away from auth
    // ============================================
    if (publicRoutes.includes(pathname)) {
      // Admin goes to admin panel
      if (profile.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // Creator goes to their dashboard (if approved)
      if (profile.role === "creator") {
        if (profile.verification_status === "approved") {
          return NextResponse.redirect(
            new URL("/creator/dashboard", request.url)
          );
        } else {
          return NextResponse.redirect(new URL("/creator/verify", request.url));
        }
      }

      // Regular viewer goes to dashboard
      if (profile.is_verified) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Unverified goes to OTP
      if (pathname !== "/login" && pathname !== "/sign-up") {
        return NextResponse.redirect(new URL("/verify-otp", request.url));
      }
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

### FIX #8: Update OTP Send Rate Limit

Already done in FIX #5 in lib/redis.ts - use updated version:

```typescript
export const otpSendRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes (NOT 3 per hour)
});
```

---

## 📋 Implementation Checklist

### Wohking - Must Do:
- [ ] Copy FIX #1 (File size validation) → app/api/upload/route.ts
- [ ] Copy FIX #2 (Rate limiting) → lib/redis.ts
- [ ] Copy FIX #3 (Error logging) → app/api/upload/route.ts
- [ ] Copy FIX #4 (Safe logging) → lib/logging.ts (new file)
- [ ] Run database migration from database_migrations.sql
- [ ] Test file upload with oversized file (should fail)
- [ ] Test rapid uploads (should rate limit)

### Ngam - Must Do:
- [ ] Copy FIX #5 (Email OTP) → app/api/otp/send/route.ts
- [ ] Copy FIX #6 (OTP verify + rate limit) → app/api/otp/verify/route.ts
- [ ] Copy FIX #7 (Middleware) → middleware.js
- [ ] Copy FIX #8 (Rate limiter update) → lib/redis.ts
- [ ] Run database migration from database_migrations.sql
- [ ] Set SendGrid API key in .env.local
- [ ] Test email OTP sending (should receive email)
- [ ] Test OTP verification with rate limiting

### Both - After Fixes:
- [ ] Test login → OTP → verified flow end-to-end
- [ ] Test creator role access to /creator routes
- [ ] Test admin access to /admin routes
- [ ] Run on staging before production

---

## ✅ Validation Commands

**Test file size:**
```bash
# Create 100MB test file
dd if=/dev/zero of=large.bin bs=1M count=100

# Try to upload (should fail with 413)
curl -X POST http://localhost:3000/api/upload \
  -F "file=@large.bin" \
  -F "category=national_id"
```

**Test OTP email:**
```bash
# Send OTP
curl -X POST http://localhost:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check your email inbox!
```

**Test rate limiting:**
```bash
# Rapid-fire 15 requests (should fail after 5)
for i in {1..15}; do \
  curl -X POST http://localhost:3000/api/otp/send \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'; \
done
```

---

**Questions?** Reference CODE_REVIEW_SPRINT1.md for detailed explanations.

