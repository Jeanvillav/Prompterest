-- Crear bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prompt-images', 'prompt-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Permitir lectura pública
CREATE POLICY "Prompt Images Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'prompt-images');

-- Permitir subida a usuarios autenticados
CREATE POLICY "Users can upload prompt images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'prompt-images' AND auth.role() = 'authenticated');
