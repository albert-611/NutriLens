-- NutriLens Seed Data: Demo Profiles Provisioning (Deprecated)
-- supabase/seeds/06_demo_profiles_provisioning.sql
-- AUTHENTICATION HARDENING: Fake authentication accounts and demo users have been removed.
-- Real user accounts are registered dynamically via Supabase Auth.
-- This file is retained as an idempotent migration cleanup script.

DELETE FROM public.profiles 
WHERE id IN (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000003'::uuid
);

DROP FUNCTION IF EXISTS public.provision_demo_profile(UUID, TEXT, TEXT, UUID, VARCHAR, TEXT, INTEGER, NUMERIC, INTEGER, TEXT[], TEXT[]);
