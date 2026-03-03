-- Fix Relationships for Supabase Joins (PostgREST)
-- Points user_id to public.profiles instead of auth.users to enable automatic joins

-- Fix Prompts relationship
ALTER TABLE public.prompts
DROP CONSTRAINT IF EXISTS prompts_user_id_fkey,
ADD CONSTRAINT prompts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix Saved Prompts relationship
ALTER TABLE public.saved_prompts
DROP CONSTRAINT IF EXISTS saved_prompts_user_id_fkey,
ADD CONSTRAINT saved_prompts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix Ratings relationship
ALTER TABLE public.ratings
DROP CONSTRAINT IF EXISTS ratings_user_id_fkey,
ADD CONSTRAINT ratings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix Comments relationship
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey,
ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
