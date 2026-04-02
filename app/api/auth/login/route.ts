import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.error('🔴 Sign in error:', error.message);

      let userMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        userMessage = 'Please confirm your email address before logging in.';
      } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        userMessage = 'Too many attempts. Please try again in a few minutes.';
      } else if (error.message.includes('User not found')) {
        userMessage = 'No account found with this email address.';
      }

      return NextResponse.json({ error: userMessage }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Authentication failed. Please try again.' }, { status: 400 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = userData?.role || 'client';
    console.log('🟢 Login API successful, role:', role);
    
    // Returning success, client handles redirect
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: data.user,
      role: role,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      redirectTo: role === 'admin' ? '/admin' : '/dashboard'
    });

  } catch (error) {
    console.error('🔴 Unexpected login API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
