-- NutriLens Database Migration
-- 20261116000015_create_ai_conversations_and_messages.sql
-- Production AI Nutrition Assistant Tables with Strict Row Level Security (RLS)

BEGIN;

-- 1. AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated
    ON ai_conversations(user_id, updated_at DESC);

-- 2. AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created
    ON ai_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id
    ON ai_messages(user_id);

-- 3. AI Usage & Token Tracking Logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    request_status TEXT NOT NULL DEFAULT 'success',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created
    ON ai_usage_logs(user_id, created_at DESC);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: ai_conversations (Users can ONLY view, create, edit, and delete their own conversations)
DROP POLICY IF EXISTS "Users can view their own conversations" ON ai_conversations;
CREATE POLICY "Users can view their own conversations"
    ON ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own conversations" ON ai_conversations;
CREATE POLICY "Users can insert their own conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON ai_conversations;
CREATE POLICY "Users can update their own conversations"
    ON ai_conversations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON ai_conversations;
CREATE POLICY "Users can delete their own conversations"
    ON ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies: ai_messages (Users can ONLY view and insert messages in their own conversations)
DROP POLICY IF EXISTS "Users can view messages in their own conversations" ON ai_messages;
CREATE POLICY "Users can view messages in their own conversations"
    ON ai_messages FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert messages into their own conversations" ON ai_messages;
CREATE POLICY "Users can insert messages into their own conversations"
    ON ai_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own messages" ON ai_messages;
CREATE POLICY "Users can delete their own messages"
    ON ai_messages FOR DELETE
    USING (auth.uid() = user_id);

-- 7. RLS Policies: ai_usage_logs
DROP POLICY IF EXISTS "Users can view their own AI usage logs" ON ai_usage_logs;
CREATE POLICY "Users can view their own AI usage logs"
    ON ai_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI usage logs" ON ai_usage_logs;
CREATE POLICY "Users can insert their own AI usage logs"
    ON ai_usage_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

COMMIT;
