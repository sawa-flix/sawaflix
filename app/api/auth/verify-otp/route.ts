import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { EmailOtpType } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, token, type } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Default to 'signup' if not provided
    const otpType: EmailOtpType = (type as EmailOtpType) || 'signup';

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: otpType,
    });

    if (error) {
      console.error('🔴 OTP verification error:', error.message);

      let userMessage = error.message;
      if (error.message.includes('Token has expired or is invalid')) {
        userMessage = 'The OTP code is invalid or has expired. Please try again or request a new code.';
      }

      return NextResponse.json({ error: userMessage }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = userData?.role || 'client';
    console.log('🟢 Verify OTP API successful, role:', role);
    
    // Returning success, client handles redirect
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: data.user,
      role: role,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      redirectTo: role === 'admin' ? '/admin' : '/dashboard'
    });

  } catch (error) {
    console.error('🔴 Unexpected OTP verification error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
