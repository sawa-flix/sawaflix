import { NextResponse } from 'next/server'
import { otpVerifyRateLimit, redis } from '@/lib/redis'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        const { success } = await otpVerifyRateLimit.limit(`otp_verify:${email}`)
        if (!success) {
            return NextResponse.json({ error: "Too many OTP verification attempts. Please try again later." }, { status: 429 })
        }
        
        const storedOtp = await redis.get(`otp:${email}`)

        if (!storedOtp) {
            return NextResponse.json({error: `OTP expired or invalid` }, { status: 400 }) 
        }
        if (String(storedOtp).trim() !== String(code).trim()) {
            return NextResponse.json({ error: `Invalid OTP` }, { status: 400 })
        }

        await redis.del(`otp:${email}`)
        const { error } = await supabaseAdmin
        .from('users')
        .update({ is_verified: true})
        .eq('email', email)

        if (error) {
            console.log('Error updating user verification status:', error)
            return NextResponse.json({ error: `Failed to verify user` }, { status: 500 })
        }
        return NextResponse.json({ message: 'User verified successfully' })
    } catch (error) {
        console.log('Error verifying OTP:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}