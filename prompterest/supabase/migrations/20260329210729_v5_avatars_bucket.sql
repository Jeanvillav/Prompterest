-- Crear el bucket de avatares si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Política de lectura pública
CREATE POLICY "Avatars Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Política de inserción para usuarios (solo pueden subir a su propia carpeta)
CREATE POLICY "Users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);