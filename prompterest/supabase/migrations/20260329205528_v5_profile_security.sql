-- Migración V5: Seguridad de Perfiles Dinámicos
-- Objetivo: Garantizar que cada usuario solo pueda actualizar su propia imagen de perfil.

-- 1. Asegurarse de que Row Level Security (RLS) esté habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Política de Lectura: Todos pueden ver los perfiles públicos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Los perfiles son visibles por todos.' 
        AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Los perfiles son visibles por todos." 
        ON public.profiles FOR SELECT 
        USING (true);
    END IF;
END
$$;

-- 3. Política Crítica de Edición (UPDATE): Solo el dueño puede modificar su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil." ON public.profiles;

CREATE POLICY "Los usuarios pueden actualizar su propio perfil." 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
