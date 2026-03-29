-- 1. Create media_type ENUM
CREATE TYPE media_type AS ENUM ('image', 'video', 'none');

-- 2. Alter prompts table for media support
ALTER TABLE prompts
RENAME COLUMN image_url TO media_url;

ALTER TABLE prompts
ALTER COLUMN media_url DROP NOT NULL;

ALTER TABLE prompts
ADD COLUMN media_type media_type NOT NULL DEFAULT 'image';

-- 3. Modify AI Models to support multiple (Array)
ALTER TABLE prompts
ADD COLUMN ai_models TEXT[] DEFAULT '{}';

-- Migrate existing ai_model data to the new array
UPDATE prompts
SET ai_models = ARRAY[ai_model]
WHERE ai_model IS NOT NULL;

-- Remove the old ai_model column
ALTER TABLE prompts
DROP COLUMN ai_model;

-- 4. Add 'Claude Skill' to categories if it doesn't exist
INSERT INTO categories (name, slug)
VALUES ('Claude Skill', 'claude-skill')
ON CONFLICT (slug) DO NOTHING;
