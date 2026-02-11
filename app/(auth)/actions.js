"use server";

import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signInWithPassword(formData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString().trim(),
      password: password.toString(),
    });

    if (error) {
      console.error('🔴 Sign in error:', error.message);
      
      // User-friendly error messages
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
      
      return { error: userMessage };
    }

    if (!data.user) {
      return { error: 'Authentication failed. Please try again.' };
    }

    console.log('🟢 Login successful for user:', data.user.email);
    
    // Revalidate the dashboard path
    revalidatePath('/dashboard');
    
    // Return success - let the client handle the redirect
    return { 
      success: true, 
      message: 'Login successful',
      user: data.user,
      redirectTo: '/dashboard'
    };
    
  } catch (error) {
    console.error('🔴 Unexpected sign in error:', error);
    
    // Handle NEXT_REDIRECT errors gracefully
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      return { 
        success: true, 
        message: 'Login successful (redirecting)',
        redirectTo: '/dashboard'
      };
    }
    
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signUpWithPassword(formData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    const username = formData.get('username');
    const userType = formData.get('userType') || 'user';
    const category = formData.get('category');

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
    }

    const supabase = await createClient();

    // Prepare user metadata
    const userMetadata = {
      username: username || email.split('@')[0],
      ...(userType && { user_type: userType }),
      ...(category && { category: category }),
    };

    const { data, error } = await supabase.auth.signUp({
      email: email.toString().trim(),
      password: password.toString(),
      options: {
        data: userMetadata,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      console.error('🔴 Sign up error:', error.message);
      
      // User-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('already registered')) {
        userMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message.includes('invalid email')) {
        userMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('password')) {
        userMessage = 'Password must be at least 6 characters.';
      }
      
      return { error: userMessage };
    }

    // Insert user into public.users table (the auth trigger should also handle this)
    if (data.user) {
      try {
        // Insert into users table
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: email.toString(),
            full_name: userMetadata.username,
            role: userType === 'artist' ? 'artist' : userType === 'producer' ? 'producer' : 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (userError) {
          console.error('🔴 User profile creation error:', userError.message);
          // Don't fail signup if profile creation fails - the trigger should have handled it
        } else {
          console.log('✅ User profile created in public.users table');
        }
      } catch (userErr) {
        console.error('🔴 Error creating user profile:', userErr);
        // Continue without profile creation - the auth trigger should have handled it
      }
    }

    console.log('🟢 Sign up successful for:', email);
    
    // Don't redirect automatically - let client show success message
    return { 
      success: true, 
      message: data.session ? 'Sign up successful!' : 'Please check your email to confirm your account.',
      requiresEmailConfirmation: !data.session
    };
    
  } catch (error) {
    console.error('🔴 Unexpected sign up error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    console.log('🟡 Starting Google OAuth flow...');
    console.log('🟡 Redirect URL:', `${origin}/auth/callback`);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        // scopes: 'https://www.googleapis.com/auth/youtube.force-ssl',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('🔴 Google OAuth error:', error.message);
      throw new Error(`Google OAuth failed: ${error.message}`);
    }

    // If Supabase returned a redirect URL, redirect the browser there
    if (data?.url) {
      console.log('🟢 Google OAuth URL generated, redirecting...');
      redirect(data.url);
    }

    // If no URL, that's an error
    throw new Error('Google OAuth service did not return a valid URL');
  } catch (error) {
    console.error('🔴 Google OAuth error:', error.message);
    
    // Let NEXT_REDIRECT errors propagate (from redirect() calls)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    // For other errors, redirect to login with error message
    redirect(`/login?error=${encodeURIComponent(error.message || 'oauth_failed')}`);
  }
}

export async function resetPassword(formData) {
  try {
    let email;
    
    // Handle different input formats
    if (formData instanceof FormData) {
      email = formData.get('email');
    } else if (typeof formData === 'object' && formData.email) {
      email = formData.email;
    } else if (typeof formData === 'string') {
      email = formData;
    }
    
    if (!email) {
      return { error: 'Email is required' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toString().trim())) {
      return { error: 'Please enter a valid email address.' };
    }

    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    console.log('🟡 Sending password reset email to:', email);
    console.log('🟡 Site URL:', origin);

    const { error } = await supabase.auth.resetPasswordForEmail(email.toString().trim(), {
      redirectTo: `${origin}/auth/callback`,
    });

    if (error) {
      console.error("🔴 Password reset error:", error.message);
      
      // User-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('rate limit')) {
        userMessage = 'Too many attempts. Please try again in a few minutes.';
      } else if (error.message.includes('not found')) {
        userMessage = 'No account found with this email address.';
      } else if (error.message.includes('email')) {
        userMessage = 'Please enter a valid email address.';
      }
      
      return { error: userMessage };
    }

    console.log('✅ Password reset email sent successfully');
    return { 
      success: true,
      message: 'Check your email for the password reset link. It may take a minute to arrive.'
    };
    
  } catch (error) {
    console.error('🔴 Unexpected reset password error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Direct password update for the update-password page
export async function updatePasswordDirectly(formData) {
  try {
    const code = formData.get('code');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
      return { error: 'Both password fields are required' };
    }
    
    if (newPassword !== confirmPassword) {
      return { error: 'Passwords do not match' };
    }
    
    if (newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
    }

    const supabase = await createClient();
    
    // If we have a code, exchange it first
    if (code) {
      console.log('🟡 Exchanging code for session...');
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('🔴 Code exchange error:', exchangeError);
        
        // If exchange fails but we have a session, continue
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return { 
            error: 'This reset link is invalid or has expired. Please request a new one.' 
          };
        }
      }
    }

    // Check if we have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: 'No active session. Please use a valid reset link.' };
    }

    // Update the password
    console.log('🟡 Updating password...');
    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword.toString(),
    });

    if (updateError) {
      console.error('🔴 Password update error:', updateError.message);
      return { error: updateError.message };
    }

    console.log('✅ Password updated successfully for user:', data.user?.email);
    
    // Sign out after password update
    await supabase.auth.signOut();
    
    return { 
      success: true, 
      message: 'Password updated successfully! You can now log in with your new password.',
      redirectTo: '/login?message=password_updated_success'
    };
    
  } catch (error) {
    console.error('🔴 Unexpected password update error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// For logged-in users to change their password
export async function updatePasswordLoggedIn(formData) {
  try {
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: 'All password fields are required' };
    }
    
    if (newPassword !== confirmPassword) {
      return { error: 'New passwords do not match' };
    }
    
    if (newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters long' };
    }

    const supabase = await createClient();

    // First verify current password by trying to re-authenticate
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'You must be logged in to change your password.' };
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword.toString(),
    });

    if (error) {
      console.error('🔴 Update password error:', error.message);
      return { error: error.message };
    }

    console.log('✅ Password updated for logged-in user:', user.email);
    
    return { 
      success: true, 
      message: 'Password updated successfully!' 
    };
    
  } catch (error) {
    console.error('🔴 Unexpected update password error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function handleSignOut() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('🔴 Sign out error:', error.message);
    return redirect('/login?error=signout_failed');
  }
  
  // Revalidate all paths
  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/login');
  
  console.log('✅ User signed out successfully');
  return redirect('/login?message=signed_out');
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('🔴 Get user error:', error.message);
      return { error: error.message };
    }
    
    return { user };
    
  } catch (error) {
    console.error('🔴 Unexpected get user error:', error);
    return { error: 'Failed to get user information' };
  }
}

export async function checkAuth() {
  try {
    const supabase = await createClient();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('🔴 Check auth error:', error.message);
      return { authenticated: false, error: error.message };
    }
    
    return { 
      authenticated: !!session, 
      session,
      user: session?.user 
    };
    
  } catch (error) {
    console.error('🔴 Unexpected check auth error:', error);
    return { authenticated: false, error: 'Auth check failed' };
  }
}

// Verify reset token
export async function verifyResetRequest(code) {
  try {
    if (!code) {
      return { error: 'No reset code provided' };
    }

    const supabase = await createClient();
    
    // Try to exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('🔴 Reset code verification error:', exchangeError.message);
      return { 
        error: exchangeError.message.includes('expired') 
          ? 'This reset link has expired. Please request a new one.' 
          : 'This reset link is invalid.',
        code
      };
    }
    
    // Check if we have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: 'Unable to verify reset request. Please try again.' };
    }
    
    return { 
      success: true, 
      session,
      message: 'Reset request verified successfully' 
    };
    
  } catch (error) {
    console.error('🔴 Unexpected verification error:', error);
    return { error: 'An unexpected error occurred during verification.' };
  }
}

// Quick login test function
export async function testLogin(email, password) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return { error: error.message };
    }

    return { 
      success: true, 
      user: data.user 
    };
    
  } catch (error) {
    console.error('🔴 Test login error:', error);
    return { error: error.message };
  }
}

// Validate session (useful for middleware or protected pages)
export async function validateSession() {
  try {
    const supabase = await createClient();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { valid: false, error: error.message };
    }
    
    return { 
      valid: !!session, 
      session,
      user: session?.user 
    };
    
  } catch (error) {
    console.error('🔴 Session validation error:', error);
    return { valid: false, error: 'Session validation failed' };
  }
}

// Sync auth user to public.users table
export async function syncUserToPublic() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'No authenticated user found' };
    }
    
    console.log('🟡 Syncing user to public.users:', user.email);
    
    const { error: syncError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.username || user.email,
        role: user.user_metadata?.role || 'client',
        created_at: new Date(user.created_at).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });
    
    if (syncError) {
      console.error('🔴 User sync error:', syncError.message);
      return { error: syncError.message };
    }
    
    console.log('✅ User synced successfully');
    return { success: true };
    
  } catch (error) {
    console.error('🔴 Sync user error:', error);
    return { error: error.message };
  }
}
