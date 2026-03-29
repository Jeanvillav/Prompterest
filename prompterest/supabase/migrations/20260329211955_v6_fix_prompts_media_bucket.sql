-- Migración V6: Restaurar el bucket principal multimedia (prompt-images)
-- Este script reinstala el bucket que se usa en src/components/prompt-form.tsx

-- Crear el bucket de multimedia de los prompts si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prompt-images', 'prompt-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Política 1: Lectura pública (Cualquiera puede ver las imágenes y videos del bucket)
CREATE POLICY "Prompt Media Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'prompt-images');

-- Política 2: Inserción para usuarios (Solo los autenticados pueden subir contenido en él)
CREATE POLICY "Authenticated users can upload prompt media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'prompt-images' AND auth.role() = 'authenticated');
