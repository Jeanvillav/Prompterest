-- Update the handle_new_user function to set a default avatar_url if not provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  generated_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || generated_username
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users that have NULL avatar_url
UPDATE public.profiles
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || username
WHERE avatar_url IS NULL OR avatar_url = '';
