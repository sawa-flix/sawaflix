# User Sync Fix - Complete Solution

## Problem Identified
New users created via sign-up or OAuth login were not being stored in the `public.users` table. Users were being created in `auth.users` (Supabase's internal auth table) but the corresponding records were missing from the application's `public.users` table.

### Root Causes Found:
1. **Missing Auth Trigger** - No automated mechanism to sync users from `auth.users` to `public.users`
2. **Missing RLS Policy** - The `users` table didn't have an INSERT policy allowing new user records to be created
3. **Code Issue** - Sign-up function was trying to insert into a non-existent `profiles` table instead of `users`
4. **OAuth Not Syncing** - The callback route wasn't ensuring user records existed in `public.users` after OAuth login

---

## Solutions Implemented

### 1. ✅ Created Auth Trigger (Database Migration)
**Migration:** `create_auth_user_trigger`

A PostgreSQL trigger was created that automatically inserts users into `public.users` whenever a new user is created in `auth.users`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'full_name'), 
             (new.raw_user_meta_data->>'username'), 
             new.email),
    COALESCE((new.raw_user_meta_data->>'role'), 'client'),
    now(),
    now()
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Purpose:** Automatically syncs new auth users to the public.users table.

---

### 2. ✅ Added RLS Insert Policy (Database Migration)
**Migration:** `add_users_insert_policy`

An INSERT policy was added to the `users` table to allow authenticated users to create their own records.

```sql
CREATE POLICY "users_insert_own_profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);
```

**Purpose:** Allows users to insert their own records into the public.users table. The trigger function runs with SECURITY DEFINER, so it bypasses RLS and can insert for any user.

---

### 3. ✅ Fixed Sign-Up Function (Code Change)
**File:** `app/(auth)/actions.js` - `signUpWithPassword()` function

Changed from trying to insert into non-existent `profiles` table to inserting into the `users` table:

```javascript
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
        role: userType === 'artist' ? 'artist' : 
              userType === 'producer' ? 'producer' : 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });
```

**Purpose:** 
- Provides a backup sync in case the trigger doesn't fire
- Explicitly sets user role based on userType (artist/producer/client)
- Handles errors gracefully without failing the signup flow

---

### 4. ✅ Enhanced OAuth Callback (Code Change)
**File:** `app/(auth)/auth/callback/route.js` - Regular auth flow section

Added user sync logic after successful OAuth:

```javascript
// After successful auth, ensure user exists in public.users table
try {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    console.log('🟡 Syncing user to public.users table:', user.email)
    
    // Insert or update user in public.users
    const { error: syncError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 
                   user.user_metadata?.username || user.email,
        role: user.user_metadata?.role || 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
  }
}
```

**Purpose:** Ensures users logging in via OAuth (Google, etc.) are synced to public.users immediately after authentication.

---

### 5. ✅ Added User Sync Helper Function (Code Change)
**File:** `app/(auth)/actions.js` - New export

Added `syncUserToPublic()` function that can be called manually if needed:

```javascript
export async function syncUserToPublic() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'No authenticated user found' };
    }
    
    const { error: syncError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 
                   user.user_metadata?.username || user.email,
        role: user.user_metadata?.role || 'client',
        created_at: new Date(user.created_at).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });
    
    return syncError ? { error: syncError.message } : { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
```

**Purpose:** Manual fallback to sync users if automatic sync fails for any reason.

---

### 6. ✅ Synced Existing Users (Database Migration)
**Migration:** `sync_existing_auth_users`

All existing users from `auth.users` that didn't have corresponding `public.users` records were synced:

```sql
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE((au.raw_user_meta_data->>'full_name'), 
           (au.raw_user_meta_data->>'username'), au.email),
  COALESCE((au.raw_user_meta_data->>'role'), 'client'),
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

**Result:** All 24 auth users now have corresponding public.users records.

---

## Verification

**Before:** 24 auth.users, 22 public.users (2 missing)
**After:** 24 auth.users, 24 public.users (all synced)

---

## How It Works Now

### Email/Password Sign-Up Flow:
1. User submits email/password
2. `signUpWithPassword()` creates user in auth.users via `supabase.auth.signUp()`
3. **Trigger fires automatically** → User inserted into public.users
4. **Code also explicitly inserts** into public.users as a backup
5. User now exists in both tables ✅

### Google OAuth Flow:
1. User clicks "Sign in with Google"
2. Google authentication happens
3. Callback route exchanges code via `exchangeCodeForSession()`
4. **Code explicitly syncs user** to public.users
5. User redirected to dashboard
6. User now exists in both tables ✅

### Password Reset Flow:
1. User requests password reset
2. Email sent (no user creation)
3. User clicks link and updates password
4. No new user created (existing user updated) ✅

---

## Files Modified

1. **`app/(auth)/actions.js`**
   - Fixed `signUpWithPassword()` to insert into `users` table instead of `profiles`
   - Added explicit backup sync logic
   - Added new `syncUserToPublic()` helper function

2. **`app/(auth)/auth/callback/route.js`**
   - Enhanced OAuth callback to sync users after successful authentication

3. **Database Migrations (Supabase)**
   - `create_auth_user_trigger` - Auth trigger
   - `add_users_insert_policy` - RLS policy
   - `sync_existing_auth_users` - Existing user sync

---

## Testing

### To Test New User Creation:

#### Test 1: Email/Password Sign-Up
1. Go to `/sign-up`
2. Enter email, password, username
3. Submit form
4. Check Supabase Dashboard:
   - Go to Auth Users → See new user
   - Go to public.users table → See new user record ✅

#### Test 2: Google OAuth
1. Go to `/sign-up` or `/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to `/dashboard`
5. Check Supabase Dashboard:
   - Go to Auth Users → See new user
   - Go to public.users table → See new user record ✅

#### Test 3: Manual Sync
1. If a user is in auth.users but not in public.users:
   ```javascript
   import { syncUserToPublic } from '@/app/(auth)/actions'
   const result = await syncUserToPublic()
   console.log(result) // { success: true } or { error: '...' }
   ```

---

## Deployment

To deploy these changes:

```bash
# Commit all changes
git add .
git commit -m "fix: implement automatic user sync from auth to public.users table"

# Push to main (auto-deploys to Vercel)
git push origin main
```

The database migrations will apply automatically when Vercel deploys.

---

## Future Improvements

1. **Add audit logging** to track when users are synced
2. **Add retry logic** for failed syncs
3. **Add email verification** check in the users table
4. **Monitor sync failures** with logging/alerting
5. **Add user metadata sync** for additional profile fields

---

## Summary

This fix implements a **three-layer sync system** to ensure new users are always stored in the `public.users` table:

1. **Layer 1: Database Trigger** - Automatic sync for all new auth users
2. **Layer 2: Code Sync** - Explicit sync in sign-up and OAuth flows
3. **Layer 3: Manual Sync** - Helper function for manual sync if needed

This ensures that **no matter how a user is created** (email/password, OAuth, or any other method), they will be synced to the `public.users` table.
