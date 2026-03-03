-- Tabla de guardados
CREATE TABLE public.saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_prompts_owner_only"
  ON public.saved_prompts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_prompts_user
  ON public.saved_prompts(user_id, created_at DESC);

-- Full-Text Search
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('spanish',
      coalesce(title, '') || ' ' || coalesce(description, '')
    )
  ) STORED;

CREATE INDEX idx_prompts_search
  ON public.prompts USING GIN(search_vector);
