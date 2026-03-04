-- 1. Tabla Categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);

-- 2. Habilitar Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Lectura Pública
CREATE POLICY "Categories are viewable by everyone" 
    ON public.categories FOR SELECT 
    USING (true);

-- (La inserción está bloqueada por defecto para usuarios normales al no haber política de INSERT)

-- 4. Inserts iniciales
INSERT INTO public.categories (name, slug) VALUES 
    ('Programación', 'programacion'),
    ('Marketing', 'marketing'),
    ('Arte y Diseño', 'arte-y-diseno'),
    ('Productividad', 'productividad'),
    ('Educación', 'educacion'),
    ('SEO y Copywriting', 'seo-y-copywriting');

-- 5. Alterar tabla prompts
ALTER TABLE public.prompts 
    ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    ADD COLUMN ai_model TEXT DEFAULT 'ChatGPT' CHECK (
        ai_model IN (
            'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Stable Diffusion', 
            'Taskade', 'Feedough AI', 'PromptGen', 'HIX AI', 'FlowGPT', 
            'PromptLayer', 'LangChain', 'Perplexity'
        )
    );
