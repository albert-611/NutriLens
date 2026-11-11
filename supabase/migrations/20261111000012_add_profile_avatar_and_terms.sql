-- NutriLens Database Migration
-- 20261111000012_add_profile_avatar_and_terms.sql
-- Adds profile photo (avatar_url), terms acceptance tracking, and onboarding status columns.

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0',
    ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'ONBOARDING_COMPLETED' CHECK (onboarding_status IN ('ONBOARDING_REQUIRED', 'ONBOARDING_COMPLETED'));

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user avatars
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY IF NOT EXISTS "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY IF NOT EXISTS "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
