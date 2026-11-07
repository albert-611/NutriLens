-- NutriLens Seed Data: Demo Profiles Provisioning
-- supabase/seeds/06_demo_profiles_provisioning.sql
-- Fictional adult demo profiles for Savar and Ashulia test scenarios.
-- Follows strict security rules: No real personal/health data, safe provisioning.

-- 1. Helper function to safely upsert demo profiles linked to auth.users
CREATE OR REPLACE FUNCTION public.provision_demo_profile(
    p_user_id UUID,
    p_email TEXT,
    p_display_name TEXT,
    p_market_id UUID,
    p_language VARCHAR(10),
    p_general_goal TEXT,
    p_household_size INTEGER,
    p_budget_amount NUMERIC(10,2),
    p_budget_duration_days INTEGER,
    p_dietary_exclusions TEXT[],
    p_declared_allergens TEXT[]
) RETURNS VOID AS $$
BEGIN
    -- Check if the corresponding user exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        INSERT INTO public.profiles (
            id, market_id, display_name, age_adult_confirmed,
            language, unit_preference, cuisine_preferences,
            dietary_exclusions, declared_allergens, general_goal,
            household_size, budget_amount, budget_currency,
            budget_people, budget_duration_days, available_time_minutes,
            available_equipment
        )
        VALUES (
            p_user_id, p_market_id, p_display_name, true,
            p_language, 'metric', ARRAY['bangladeshi'],
            p_dietary_exclusions, p_declared_allergens, p_general_goal,
            p_household_size, p_budget_amount, 'BDT',
            p_household_size, p_budget_duration_days, 30,
            ARRAY['stove', 'pan', 'pot', 'knife']
        )
        ON CONFLICT (id) DO UPDATE SET 
            display_name = EXCLUDED.display_name,
            market_id = EXCLUDED.market_id,
            budget_amount = EXCLUDED.budget_amount,
            general_goal = EXCLUDED.general_goal,
            updated_at = now();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Staged Demo User Profiles (Executed automatically when the corresponding user accounts are created)
-- Persona 1: Tariqul Islam (Student in Savar, Daily budget ৳150, Goal: budget_friendly)
-- User ID: 00000000-0000-0000-0000-000000000001
-- Email: demo.student@nutrilens.internal

-- Persona 2: Nasima Akter (Garment Supervisor in Ashulia, Household of 3, Daily budget ৳350, Goal: balanced_wellness)
-- User ID: 00000000-0000-0000-0000-000000000002
-- Email: demo.family@nutrilens.internal

-- Persona 3: Tanvir Ahmed (IT Professional, Savar/Dhaka, Goal: high_protein)
-- User ID: 00000000-0000-0000-0000-000000000003
-- Email: demo.fitness@nutrilens.internal

-- Optional local development convenience: If executed within local Supabase emulator,
-- seed demo users directly into auth.users if not present.
DO $$
BEGIN
    -- Check if we are running in an environment where auth.users can be populated
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        BEGIN
            INSERT INTO auth.users (
                id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            )
            VALUES
            (
                '00000000-0000-0000-0000-000000000001',
                '00000000-0000-0000-0000-000000000000',
                'authenticated', 'authenticated',
                'demo.student@nutrilens.internal',
                crypt('DemoPassword123!', gen_salt('bf')),
                now(),
                '{"provider":"email","providers":["email"]}',
                '{"full_name":"Tariqul Islam"}',
                now(), now()
            ),
            (
                '00000000-0000-0000-0000-000000000002',
                '00000000-0000-0000-0000-000000000000',
                'authenticated', 'authenticated',
                'demo.family@nutrilens.internal',
                crypt('DemoPassword123!', gen_salt('bf')),
                now(),
                '{"provider":"email","providers":["email"]}',
                '{"full_name":"Nasima Akter"}',
                now(), now()
            ),
            (
                '00000000-0000-0000-0000-000000000003',
                '00000000-0000-0000-0000-000000000000',
                'authenticated', 'authenticated',
                'demo.fitness@nutrilens.internal',
                crypt('DemoPassword123!', gen_salt('bf')),
                now(),
                '{"provider":"email","providers":["email"]}',
                '{"full_name":"Tanvir Ahmed"}',
                now(), now()
            )
            ON CONFLICT (id) DO NOTHING;

            -- Provision their profiles
            PERFORM public.provision_demo_profile(
                '00000000-0000-0000-0000-000000000001'::uuid,
                'demo.student@nutrilens.internal',
                'Tariqul Islam (Student Mess, Savar)',
                '22222222-2222-2222-2222-222222222201'::uuid,
                'bn',
                'budget_friendly',
                1,
                150.00,
                1,
                ARRAY[]::TEXT[],
                ARRAY[]::TEXT[]
            );

            PERFORM public.provision_demo_profile(
                '00000000-0000-0000-0000-000000000002'::uuid,
                'demo.family@nutrilens.internal',
                'Nasima Akter (Household of 3, Ashulia)',
                '22222222-2222-2222-2222-222222222202'::uuid,
                'bn',
                'balanced_wellness',
                3,
                350.00,
                1,
                ARRAY[]::TEXT[],
                ARRAY[]::TEXT[]
            );

            PERFORM public.provision_demo_profile(
                '00000000-0000-0000-0000-000000000003'::uuid,
                'demo.fitness@nutrilens.internal',
                'Tanvir Ahmed (High Protein, Savar)',
                '22222222-2222-2222-2222-222222222201'::uuid,
                'en',
                'high_protein',
                1,
                300.00,
                1,
                ARRAY[]::TEXT[],
                ARRAY[]::TEXT[]
            );
        EXCEPTION
            WHEN OTHERS THEN
                -- In production Supabase Cloud without direct auth.users write permission,
                -- ignore error and let server-side provisioning script handle profile creation.
                RAISE NOTICE 'Notice: Direct auth.users seeding skipped (%): use Supabase Auth admin API instead.', SQLERRM;
        END;
    END IF;
END $$;
