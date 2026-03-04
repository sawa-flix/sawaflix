import { NextResponse } from "next/server";
import { redis, otpSendRateLimit } from "@/lib/redis";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

<<<<<<< HEAD
        // Input validation
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Rate limiting — 5 OTP sends per 15 minutes per email
        const rateLimitResult = await otpSendRateLimit.limit(`otp_send:${email}`);
        console.log(`[Rate Limit] Email: ${email}, Success: ${rateLimitResult.success}, Remaining: ${rateLimitResult.remaining}`);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "Too many OTP requests. Try again in 15 minutes." },
                { status: 429 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis with 5-minute expiration
        await redis.set(`otp:${email}`, otp, { ex: 300 });
=======
        if (rateLimit) {
            const { success } = await rateLimit.limit(`otp_limit:${email}`)
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Try again in an hour." },
                    { status: 429 }
                )
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if (redis) {
            await redis.set(`otp:${email}`, otp, { ex: 300})
        }
>>>>>>> 82d1c9168819be76a06979fc555fa3d2d3adeb9b

        // Send via SendGrid
        console.log(`[SendGrid] Attempting to send OTP to ${email} from ${process.env.SENDGRID_FROM_EMAIL}`);
        const [sgResponse] = await sgMail.send({
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: "🔐 Your SawaFlix Verification Code",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 12px;">
          <h2 style="color: #FF6B35; margin-bottom: 8px;">Welcome to SawaFlix</h2>
          <p style="color: #ccc; font-size: 16px;">Your verification code is:</p>
          <div style="background: #1a1a1a; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <h1 style="color: #FF6B35; font-size: 48px; letter-spacing: 10px; margin: 0; font-family: monospace;">
              ${otp}
            </h1>
          </div>
          <p style="color: #888; font-size: 14px;">This code expires in <strong>5 minutes</strong>.</p>
          <p style="color: #555; font-size: 12px; margin-top: 24px;">
            If you did not request this code, please ignore this email. Never share this code with anyone.
          </p>
        </div>
      `,
        });

        console.log(`[SendGrid Response] Status: ${sgResponse.statusCode}`);

        // Audit log, not exposing the otp
        console.log(
            `[OTP Sent] Email: ${email}, Timestamp: ${new Date().toISOString()}`
        );

        return NextResponse.json({
            message: "OTP sent to your email successfully",
            // Only expose OTP in development for easy testing
            ...(process.env.NODE_ENV === "development" && { debug_otp: otp }),
        });
    } catch (error) {
        console.error("Error sending OTP:", error);

        if (error instanceof Error && error.message.includes("Invalid email")) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to send OTP. Please try again." },
            { status: 500 }
        );
    }
}