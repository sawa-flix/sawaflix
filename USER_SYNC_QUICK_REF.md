# Quick Reference: User Sync Fix

## What Was Fixed

**Problem:** New users weren't being stored in the `public.users` table when they signed up or logged in via OAuth.

**Solution:** Implemented a three-layer sync system:
1. Database trigger auto-syncs auth users to public.users
2. Code explicitly syncs in sign-up and OAuth flows
3. Manual sync function available for recovery

---

## Database Changes (Applied)

### 3 Migrations Applied:

1. ✅ `create_auth_user_trigger`
   - Creates trigger that auto-inserts users into public.users when they're created in auth.users

2. ✅ `add_users_insert_policy`
   - Adds RLS policy allowing authenticated users to create their own user records

3. ✅ `sync_existing_auth_users`
   - Synced all 2 missing users from auth.users to public.users
   - Result: All 24 users now have both auth.users and public.users records

---

## Code Changes (Applied)

### 2 Files Modified:

1. **`app/(auth)/actions.js`**
   - Line 116-146: Fixed `signUpWithPassword()` to insert into `users` table (not profiles)
   - Line 571-611: Added new `syncUserToPublic()` helper function
   - Fixed unused variable on line 361

2. **`app/(auth)/auth/callback/route.js`**
   - Line 63-101: Added user sync after successful OAuth login

---

## Testing Checklist

- [ ] Sign up with email/password → Check user appears in public.users table
- [ ] Sign in with Google → Check user appears in public.users table
- [ ] Check Supabase Dashboard: Auth Users table
- [ ] Check Supabase Dashboard: Public Users table
- [ ] Verify both show same count (24 users)

---

## Deployment

```bash
git add .
git commit -m "fix: implement automatic user sync from auth to public.users table"
git push origin main
```

Vercel auto-deploys. Migrations apply automatically.

---

## If Issues Occur

### Issue: User in auth.users but not in public.users

**Solution 1: Manual Sync**
```javascript
import { syncUserToPublic } from '@/app/(auth)/actions'
const result = await syncUserToPublic()
```

**Solution 2: Check Logs**
- Supabase Dashboard → Logs → API
- Look for sync errors

**Solution 3: Check RLS Policies**
- Supabase Dashboard → SQL Editor
- Run: `SELECT * FROM pg_policies WHERE tablename = 'users'`
- Should see `users_insert_own_profile` policy

---

## How New Users Are Synced

### Email/Password Signup:
1. User creates account
2. Trigger fires → User inserted into public.users
3. Code also inserts → Backup sync
4. Result: User in both tables ✅

### OAuth (Google) Login:
1. User authenticates with Google
2. Code syncs user → User inserted into public.users
3. Result: User in both tables ✅

---

## Verification Query

Run this in Supabase SQL Editor to verify:

```sql
-- Should show all counts equal
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users,
  (SELECT COUNT(*) FROM auth.users au 
   LEFT JOIN public.users pu ON au.id = pu.id 
   WHERE pu.id IS NULL) as missing_users;
```

Expected result:
```
auth_users | public_users | missing_users
24         | 24           | 0
```
