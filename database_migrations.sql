-- ====================================================================
-- SawaFlix Sprint 1 Database Migrations
-- Created: February 21, 2026
-- Status: READY TO RUN
-- ====================================================================

-- ====================================================================
-- MIGRATION 1: Add role and verification_status to profiles table
-- For: Ngam's Task - Extend Auth Roles & OTP Security
-- ====================================================================

-- Step 1: Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (
  role IN ('viewer', 'creator', 'admin')
),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified' CHECK (
  verification_status IN ('unverified', 'pending', 'approved', 'rejected', 'changes_requested')
);

-- Step 2: Ensure is_verified column exists (backward compatibility)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Step 3: Create a view to help with migration queries
CREATE OR REPLACE VIEW verification_summary AS
SELECT 
  id,
  email,
  role,
  verification_status,
  is_verified,
  created_at,
  updated_at
FROM public.profiles;

-- Step 4: Create state machine function to enforce valid transitions
CREATE OR REPLACE FUNCTION verify_status_transition(
  old_status VARCHAR,
  new_status VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  -- Valid transitions:
  -- NULL -> unverified (new user)
  -- NULL -> pending (immediate submission)
  -- unverified -> pending (user submits form)
  -- pending -> approved (admin approves)
  -- pending -> rejected (admin rejects)
  -- pending -> changes_requested (admin requests changes)
  -- approved -> pending (user resubmits after rejection)
  -- rejected -> pending (user resubmits)
  -- changes_requested -> pending (user resubmits)
  
  IF old_status IS NULL THEN
    RETURN new_status IN ('unverified', 'pending');
  END IF;
  
  CASE
    WHEN old_status = 'unverified' AND new_status = 'pending' THEN RETURN TRUE;
    WHEN old_status = 'pending' AND new_status IN ('approved', 'rejected', 'changes_requested') THEN RETURN TRUE;
    WHEN old_status IN ('approved', 'rejected', 'changes_requested') AND new_status = 'pending' THEN RETURN TRUE;
    WHEN old_status = new_status THEN RETURN TRUE; -- No change is fine
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to enforce status transitions
CREATE OR REPLACE FUNCTION check_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Only enforce transition check if status is changing
  IF NEW.verification_status != OLD.verification_status THEN
    IF NOT verify_status_transition(OLD.verification_status, NEW.verification_status) THEN
      RAISE EXCEPTION 'Invalid verification status transition: % -> %', 
        OLD.verification_status, NEW.verification_status;
    END IF;
  END IF;
  
  -- Sync is_verified with status for backward compatibility
  NEW.is_verified := (NEW.verification_status = 'approved' AND NEW.role != 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS trigger_verify_status_transition ON public.profiles;
CREATE TRIGGER trigger_verify_status_transition
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION check_status_transition();

-- ====================================================================
-- MIGRATION 2: Create verification_submissions table
-- For: Wohking's Task - Verification API & Storage
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (
    category IN ('traditional_stories', 'music', 'food', 'other', 'general')
  ),
  form_data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'unverified' CHECK (
    status IN ('unverified', 'pending', 'approved', 'rejected', 'changes_requested')
  ),
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One active submission per creator
  UNIQUE(creator_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_status 
  ON public.verification_submissions(status);
CREATE INDEX IF NOT EXISTS idx_verification_creator 
  ON public.verification_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_verification_created_at 
  ON public.verification_submissions(created_at DESC);

-- Enable RLS on verification_submissions
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Creators can read own submissions
CREATE POLICY "Creators can read own submissions"
ON public.verification_submissions FOR SELECT
USING (creator_id = auth.uid());

-- RLS Policy 2: Admins can read all submissions
DROP POLICY IF EXISTS "Admins can read all submissions" ON public.verification_submissions;
CREATE POLICY "Admins can read all submissions"
ON public.verification_submissions FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- RLS Policy 3: Creators can insert their own submissions
DROP POLICY IF EXISTS "Creators can insert own submissions" ON public.verification_submissions;
CREATE POLICY "Creators can insert own submissions"
ON public.verification_submissions FOR INSERT
WITH CHECK (creator_id = auth.uid());

-- RLS Policy 4: Admins can update submissions
DROP POLICY IF EXISTS "Admins can update submissions" ON public.verification_submissions;
CREATE POLICY "Admins can update submissions"
ON public.verification_submissions FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ====================================================================
-- MIGRATION 3: Create admin_actions audit table
-- For: Audit logging of admin activities
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES public.verification_submissions(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (
    action_type IN ('approved', 'rejected', 'changes_requested', 'viewed', 'exported')
  ),
  notes TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for audit trail queries
CREATE INDEX IF NOT EXISTS idx_admin_actions_date 
  ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin 
  ON public.admin_actions(admin_id);

-- Enable RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_actions FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ====================================================================
-- MIGRATION 4: Create upload_logs table
-- For: Audit logging of file uploads
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.upload_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_size BIGINT,
  status VARCHAR(20) CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_upload_logs_creator 
  ON public.upload_logs(creator_id);
CREATE INDEX IF NOT EXISTS idx_upload_logs_date 
  ON public.upload_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.upload_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own uploads
CREATE POLICY "Users can view own uploads"
ON public.upload_logs FOR SELECT
USING (creator_id = auth.uid());

-- RLS Policy: Admins can view all uploads
CREATE POLICY "Admins can view all uploads"
ON public.upload_logs FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ====================================================================
-- MIGRATION 5: Configure Supabase Storage Bucket with RLS
-- Note: Run these in Supabase SQL editor or via API
-- ====================================================================

-- Create the verification-docs bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, owner, created_at, updated_at, allowed_mime_types, file_size_limit)
VALUES (
  'verification-docs',
  'verification-docs',
  false,
  NULL,
  NOW(),
  NOW(),
  ARRAY['image/jpeg', 'image/png', 'application/pdf', 'image/webp', 'video/mp4', 'video/webm'],
  52428800 -- 50MB
)
ON CONFLICT (id) DO UPDATE SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf', 'image/webp', 'video/mp4', 'video/webm'],
  file_size_limit = 52428800;

-- RLS Policy 1: Users can upload to own folder
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy 2: Users can read own files
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy 3: Admins can read all verification documents
DROP POLICY IF EXISTS "Admins can read all verification docs" ON storage.objects;
CREATE POLICY "Admins can read all verification docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs'
  AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'admin'
);

-- RLS Policy 4: Only admins can delete
DROP POLICY IF EXISTS "Admins can delete verification docs" ON storage.objects;
CREATE POLICY "Admins can delete verification docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-docs'
  AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'admin'
);

-- ====================================================================
-- MIGRATION 6: Create helper functions
-- ====================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = user_id) = 'admin';
END;
$$ LANGUAGE plpgsql;

-- Function to assign admin role (protected)
CREATE OR REPLACE FUNCTION assign_admin_role(target_user_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  -- Only existing admins can assign admin role
  IF NOT is_admin(auth.uid()) THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, 'Only admins can assign admin role'::TEXT;
    RETURN;
  END IF;

  -- Assign role
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE id = target_user_id;

  RETURN QUERY SELECT TRUE::BOOLEAN, 'Admin role assigned successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get creator verification status summary
CREATE OR REPLACE FUNCTION get_verification_summary(user_id UUID)
RETURNS TABLE(
  creator_id UUID,
  status VARCHAR,
  submission_count BIGINT,
  last_submission TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vs.creator_id,
    vs.status::VARCHAR,
    COUNT(*) OVER (PARTITION BY vs.creator_id)::BIGINT,
    vs.updated_at,
    vs.admin_notes
  FROM public.verification_submissions vs
  WHERE vs.creator_id = user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- MIGRATION 7: Initial data / test data (OPTIONAL)
-- Uncomment only for development/testing
-- ====================================================================

-- Insert admin role for first-time setup (if you have a user ID)
-- UPDATE public.profiles 
-- SET role = 'admin', verification_status = 'approved'
-- WHERE email = 'admin@sawaflix.com'
-- LIMIT 1;

-- ====================================================================
-- VERIFICATION: Run these to confirm migrations applied correctly
-- ====================================================================

-- Check profiles table has new columns
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name IN ('role', 'verification_status', 'is_verified');

-- Check verification_submissions table exists
-- SELECT * FROM information_schema.tables WHERE table_name = 'verification_submissions';

-- Check storage bucket exists
-- SELECT id, name, public FROM storage.buckets WHERE id = 'verification-docs';

-- ====================================================================
-- ROLLBACK: If needed, use these to undo migrations
-- ====================================================================

-- -- Remove new columns (caution: data loss)
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS verification_status CASCADE;

-- -- Drop verification_submissions table (caution: data loss)
-- DROP TABLE IF EXISTS public.verification_submissions CASCADE;

-- -- Drop admin_actions table (caution: data loss)  
-- DROP TABLE IF EXISTS public.admin_actions CASCADE;

-- -- Drop upload_logs table (caution: data loss)
-- DROP TABLE IF EXISTS public.upload_logs CASCADE;

-- ====================================================================
-- Migration Complete
-- ====================================================================
