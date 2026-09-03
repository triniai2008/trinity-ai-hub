-- TriniAI — data.sql
-- Adds user-owned agents + agent run history, and seeds the built-in agent catalog.
-- Safe to run more than once.

-- ─────────────────────────────────────────────────────────────
-- 1. Custom agents owned by a user
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_agents (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  tagline    text,
  brief      text NOT NULL,
  starters   text[] NOT NULL DEFAULT '{}',
  model      text,
  thinking   text NOT NULL DEFAULT 'normal',
  enabled    boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_agents TO authenticated;
GRANT ALL ON public.user_agents TO service_role;

ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own agents" ON public.user_agents;
CREATE POLICY "Users manage their own agents"
  ON public.user_agents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS user_agents_touch ON public.user_agents;
CREATE TRIGGER user_agents_touch BEFORE UPDATE ON public.user_agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2. Agent run history (what ran, which engine, how long)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_key  text NOT NULL,
  engine     text NOT NULL DEFAULT 'builtin-agent-kernel',
  thinking   text NOT NULL DEFAULT 'normal',
  prompt     text,
  status     text NOT NULL DEFAULT 'ok',
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agent_runs TO authenticated;
GRANT ALL ON public.agent_runs TO service_role;

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own agent runs" ON public.agent_runs;
CREATE POLICY "Users read their own agent runs"
  ON public.agent_runs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS agent_runs_user_created_idx
  ON public.agent_runs (user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 3. Seed the built-in agent catalog (public.agents)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.agents (id, name, description, enabled) VALUES
  ('trinity',  'Trinity Agent',  'General-purpose agent powered by the Agent Kernel.', true),
  ('coding',   'Coding Agent',   'Writes, reviews and debugs production-quality code.', true),
  ('research', 'Research Agent', 'Deep research with structured, sourced findings.', true),
  ('planner',  'Planner Agent',  'Turns goals into concrete, sequenced plans.', true),
  ('judge',    'Judge Agent',    'Scores and compares candidate answers.', true),
  ('memory',   'Memory Agent',   'Organises what TriniAI remembers about you.', true),
  ('image',    'Image Agent',    'Designs prompts and art direction for images.', true),
  ('audio',    'Audio Agent',    'Scripts, voice direction and audio planning.', true),
  ('video',    'Video Agent',    'Storyboards, shot lists and video prompts.', true),
  ('browser',  'Browser Agent',  'Plans and explains web automation flows.', true)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      enabled = EXCLUDED.enabled;
