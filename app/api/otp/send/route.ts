import { NextResponse } from "next/server";
import { redis, rateLimit } from "@/lib/redis";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

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

        console.log(`sending otp to ${email} with code ${otp}`)
        

        return NextResponse.json({ message: "OTP sent successfully" })

    } catch (error) {
        console.log('Error sending OTP:', error)
        return NextResponse.json ({ error: 'server error'}, { status: 500})
    }
}