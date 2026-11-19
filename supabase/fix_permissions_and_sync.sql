-- ==============================================================================
-- NutriLens Supabase Project Fix & Synchronization Script
-- Project URL: https://jmzvrtfpkgbruqqctsgr.supabase.co
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Fix recipe_ingredients input_state check constraint (adds 'roasted' & 'commercial')
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'recipe_ingredients_input_state_check'
    ) THEN
        ALTER TABLE public.recipe_ingredients DROP CONSTRAINT recipe_ingredients_input_state_check;
        ALTER TABLE public.recipe_ingredients ADD CONSTRAINT recipe_ingredients_input_state_check
            CHECK (input_state IN ('raw', 'boiled', 'steamed', 'fried', 'curried', 'drained', 'roasted', 'commercial'));
    END IF;
END $$;

-- 2. Relax meal_items foreign key constraint so meals save smoothly even without seeding all food items
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'meal_items' AND column_name = 'food_id'
    ) THEN
        ALTER TABLE public.meal_items ALTER COLUMN food_id DROP NOT NULL;
        ALTER TABLE public.meal_items DROP CONSTRAINT IF EXISTS meal_items_food_id_fkey;
    END IF;
END $$;

-- 3. Create ai_conversations table if not exists
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Personal Nutrition Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id, updated_at DESC);

-- 4. Create ai_messages table if not exists
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id, created_at ASC);

-- 5. Create ai_usage_logs table if not exists
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    request_status TEXT NOT NULL DEFAULT 'success',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON public.ai_usage_logs(user_id, created_at DESC);

-- 6. Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- 7. Policies for ai_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;
CREATE POLICY "Users can view their own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.ai_conversations;
CREATE POLICY "Users can insert their own conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_conversations;
CREATE POLICY "Users can update their own conversations" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.ai_conversations;
CREATE POLICY "Users can delete their own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- 8. Policies for ai_messages
DROP POLICY IF EXISTS "Users can view messages in their own conversations" ON public.ai_messages;
CREATE POLICY "Users can view messages in their own conversations" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert messages into their own conversations" ON public.ai_messages;
CREATE POLICY "Users can insert messages into their own conversations" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.ai_messages;
CREATE POLICY "Users can delete their own messages" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

-- 9. CRITICAL: Grant Schema and Table permissions to anon and authenticated roles
-- This resolves the "42501 permission denied" error from the Supabase API Gateway / PostgREST
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
