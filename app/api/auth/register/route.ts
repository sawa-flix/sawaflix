import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password, username, category, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const supabase = await createClient();

    const emailStr = email.trim();
    const userMetadata = {
      username: username || emailStr.split('@')[0],
      category: category || 'client',
      phone: phone || null,
    };

    const { data, error } = await supabase.auth.signUp({
      email: emailStr,
      password: password,
      options: {
        data: userMetadata,
      },
    });

    if (error) {
      console.error('🔴 Sign up error:', error.message);
      let userMessage = error.message;

      if (error.message.includes('already registered')) {
        userMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message.includes('invalid email')) {
        userMessage = 'Please enter a valid email address.';
      }
      return NextResponse.json({ error: userMessage }, { status: 400 });
    }

    console.log('🟢 Auth account created for:', email);
    console.log('ℹ️ Public profile creation is being handled by SQL Trigger.');

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      requiresEmailConfirmation: !!data.user?.identities?.length && data.session === null,
      user: data.user,
    });

  } catch (error: any) {
    console.error('🔴 Unexpected sign up error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
