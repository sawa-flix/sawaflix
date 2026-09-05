# Quick Reference - Profile Edit Fix

## Files Created
1. **app/api/creator/profile/route.ts** - GET/PUT profile operations
2. **app/api/creator/upload/route.ts** - File upload to Supabase storage

## Files Modified
1. **app/(dashboard)/dashboard/edit-profile/page.jsx** - Uses local API endpoints
2. **app/(dashboard)/dashboard/profile/page.tsx** - Added social_links field
3. **components/profile/EditProfileForm.jsx** - Uses local upload API

## Key Implementation Details

### Profile API (`/api/creator/profile`)
```
GET  → Fetch user profile, map DB fields to frontend format
PUT  → Update user profile, validate data, persist to DB
Auth → Required (checks auth.getUser())
```

### Upload API (`/api/creator/upload`)
```
POST → Upload image to creator-assets bucket
Validation → File type, size (5MB max)
Returns → Public URL for uploaded file
Auth → Required
```

### Field Mapping
```
displayName      → username
bio              → bio
profileImage     → profile_image_url
bannerImage      → cover_image_url
socialLinks      → social_links
```

### Storage Bucket
```
Bucket: creator-assets
Size: 5MB
Type: Images
Path: {userId}/{category}/{timestamp}.{ext}
```

## How It Works

### Edit Profile Flow
1. User navigates to `/dashboard/edit-profile`
2. Page fetches profile from `/api/creator/profile` (GET)
3. Form loads with user data
4. User uploads image → `/api/creator/upload` → Returns URL
5. User submits form → `/api/creator/profile` (PUT) → Saves to DB
6. Success modal → Redirect to `/dashboard/profile`

### Profile Display Flow
1. User navigates to `/dashboard/profile`
2. Server fetches profile from users table
3. Page displays profile data
4. Edit link goes to `/dashboard/edit-profile`

## Database Verification
```sql
-- Check users table fields
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check storage buckets
SELECT * FROM storage.buckets WHERE name = 'creator-assets';
```

## Testing API Endpoints

### Test GET Profile
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/creator/profile
```

### Test PUT Profile
```bash
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"New Name","bio":"New Bio"}' \
  https://your-domain.com/api/creator/profile
```

### Test File Upload
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "category=profile_image" \
  https://your-domain.com/api/creator/upload
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | No auth token | Check login, verify session |
| Profile not loading | API returning 500 | Check database connection |
| Image not uploading | File too large | Resize to <5MB |
| Changes not saving | RLS policy violation | Verify user ID matches |
| Build error | Pre-existing issue | Clear .next, rebuild |

## Frontend Component Props

### EditProfileForm
```javascript
<EditProfileForm
  initialData={{
    displayName: "User Name",
    bio: "Bio text",
    profileImage: "url",
    bannerImage: "url",
    socialLinks: [{ platform: "youtube", url: "..." }]
  }}
  onSave={(updatedData) => { /* handle save */ }}
  isSaving={false}
/>
```

## Database Queries

### Fetch Profile
```sql
SELECT id, username, bio, profile_image_url, cover_image_url, social_links
FROM users 
WHERE id = user_id;
```

### Update Profile
```sql
UPDATE users
SET username = $1, bio = $2, profile_image_url = $3, cover_image_url = $4, social_links = $5
WHERE id = $6;
```

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Notes
- All image URLs are publicly accessible
- Timestamps used for unique file naming
- Social links stored as JSONB array
- RLS policies prevent cross-user access
- Error messages shown to users in modal
