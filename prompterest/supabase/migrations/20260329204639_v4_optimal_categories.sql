-- Migración V4: Refactorización Estratégica de Categorías
-- El objetivo es tener exactamente 6 nichos, preservando los datos existentes (Actualizando los viejos).

-- 1. Actualización inteligente de categorías existentes para evitar romper Foreign Keys de los prompts antiguos.
UPDATE public.categories 
SET name = 'Ingeniería y Datos', slug = 'ingenieria-y-datos'
WHERE slug = 'programacion';

UPDATE public.categories 
SET name = 'Arte y Diseño Visual', slug = 'arte-y-diseno-visual'
WHERE slug = 'arte-y-diseno';

UPDATE public.categories 
SET name = 'Marketing y Social Media', slug = 'marketing-y-social-media'
WHERE slug = 'marketing';

UPDATE public.categories 
SET name = 'Finanzas y Operaciones', slug = 'finanzas-y-operaciones'
WHERE slug = 'productividad';

-- 'SEO y Copywriting' (slug: 'seo-y-copywriting') ya fue creada en v2.
-- 'Claude Skill' (slug: 'claude-skill') ya fue añadida en la v3.

-- 2. Eliminación de categorías obsoletas (Fallo silencioso si está en uso gracias a On Delete Restrict/Set Null)
DELETE FROM public.categories 
WHERE slug = 'educacion';

-- 3. Inserción de seguridad por si la base de datos está vacía o el script se corre en otro entorno
INSERT INTO public.categories (name, slug) VALUES 
    ('Ingeniería y Datos', 'ingenieria-y-datos'),
    ('Arte y Diseño Visual', 'arte-y-diseno-visual'),
    ('Marketing y Social Media', 'marketing-y-social-media'),
    ('SEO y Copywriting', 'seo-y-copywriting'),
    ('Finanzas y Operaciones', 'finanzas-y-operaciones'),
    ('Claude Skill', 'claude-skill')
ON CONFLICT (slug) DO NOTHING;
