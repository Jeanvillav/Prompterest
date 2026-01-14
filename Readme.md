# INFORME TÉCNICO DE ESTADO: PROMPTEREST (MVP)
> **Fecha de Actualización**: 13 Enero 2026
> **Estado**: MVP Completo / Funcional en Local

## 1. DESCRIPCIÓN DEL PROYECTO
"Prompterest" es una aplicación web tipo Pinterest para compartir y descubrir prompts de Inteligencia Artificial (Midjourney, DALL-E, etc.). Los usuarios pueden subir imágenes generadas junto con el texto (prompt) utilizado, y otros usuarios pueden verlos, copiarlos, valorarlos y comentarlos.

## 2. STACK TECNOLÓGICO Y VERSIONES
*   **Frontend**: Next.js 14+ (App Router), React, TypeScript.
*   **Estilos**: Tailwind CSS (con `tailwindcss-animate` y `lucide-react` para iconos).
*   **Backend / BaaS**: Supabase.
    *   **Auth**: Gestión de usuarios (Email/Password).
    *   **Database**: PostgreSQL.
    *   **Storage**: Almacenamiento de imágenes (`prompt-images`).
*   **Despliegue**: Preparado para Vercel (actualmente corriendo en local).

## 3. ARQUITECTURA DETALLADA
El proyecto sigue la estructura estándar de Next.js App Router:
*   `src/app/`: Rutas y páginas (`page.tsx`, `layout.tsx`).
    *   `(auth)/`: Rutas agrupadas para Login y Register.
    *   `prompt/[id]/`: Ruta dinámica para detalle (incluye sub-ruta `edit/`).
    *   `message.ts`: Middleware para proteger rutas privadas (`/submit`).
*   `src/components/`: Componentes UI reutilizables.
    *   Clave: `prompt-card.tsx` (Grid), `prompt-form.tsx` (Subida), `comment-section.tsx`.
*   `src/lib/supabase/`: Clientes de conexión.
    *   `client.ts`: `createBrowserClient` (para Client Components).
    *   `server.ts`: `createServerClient` (para Server Components/Actions, maneja cookies).

## 4. BASE DE DATOS (ESQUEMA SUPABASE)
El esquema SQL actual (`setup_prompterest.sql`) define:
*   **Tablas**:
    *   `prompts`: id, user_id, title, description, prompt_text, image_url, created_at.
    *   `ratings`: Vincula user_id + prompt_id con un valor (1-5). Constraint UNIQUE para evitar votos dobles.
    *   `comments`: Comentarios de texto plano vinculados a user_id y prompt_id.
*   **Seguridad (RLS)**:
    *   Habilitada en todas las tablas.
    *   Lectura pública (`anon`), Escritura restringida a usuarios autenticados (`authenticated`).
    *   Edición/Borrado restringido estrictamente al dueño del registro (`auth.uid() = user_id`).

## 5. ESTADO FUNCIONAL ACTUAL (DETALLE)
Todo lo listado a continuación está **IMPLEMENTADO Y PROBADO**:

### A. Core / Navegación
*   **Navbar**: Responsivo. Muestra Auth Links o Avatar de usuario.
*   **Buscador**: Funcional. Filtra por título/descripción usando `ilike` y `or`. Maneja estados vacíos personalizados.
*   **Feed (Home)**: Grid tipo mampostería ("Masonry") usando columnas CSS de Tailwind. SSR (Server Side Rendering) para carga inicial.

### B. Gestión de Contenido (CRUD)
*   **Crear (`/submit`)**: Subida de imagen a Supabase Storage + Insert en DB. Validación de formulario y contrastes de texto corregidos (negro sobre blanco).
*   **Leer (`/prompt/[id]`)**: Vista de detalle con imagen "Sticky" (se mantiene visible al hacer scroll). Botón "Copy" con feedback visual.
*   **Editar**: Ruta dedicada. Rellena el formulario con datos existentes. Solo accesible por el creador.
*   **Borrar**: Botón con confirmación (`window.confirm`). Borra de la DB (Soft delete no implementado, borrado duro).

### C. Interacciones Social
*   **Rating**: Componente de estrellas interactivo. Upsert (crear o actualizar voto). Muestra promedio simple.
*   **Comentarios**: Lista y formulario de envío. Estilos oscuros para legibilidad.

## 6. COSAS QUE FALTAN / DEUDA TÉCNICA (PARA FUTUROS DESARROLLOS)
Si otro LLM o desarrollador toma este proyecto, aquí es donde debe enfocarse:

*   **Perfiles de Usuario**: Actualmente se usa el email/ID de Supabase Auth. Faltaría crear una tabla `profiles` pública para manejar Avatares reales, Bios y "Username" personalizado.
*   **Likes/Guardados**: Diferente a Rating. Un sistema de "Bookmarks" o "Favoritos" para guardar prompts en el perfil.
*   **Dashboard de Admin**: Panel para ver todos mis prompts creados en un solo lugar (ahora mismo solo se ven en el feed general).
*   **Optimización de Imágenes**: Implementar `next/image` para Lazy Loading y optimización automática (actualmente usa `<img>` estándar).
*   **Paginación**: El feed carga TODO. Faltaría implementar "Infinite Scroll" o paginación para escalar a miles de prompts.

## 7. INSTRUCCIONES PARA RETOMAR
1.  **Instalar**: `npm install`
2.  **Entorno**: Asegurar `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `ANON_KEY`.
3.  **Base de Datos**: Si es un entorno nuevo, correr `setup_prompterest.sql` en Supabase.
4.  **Ejecutar**: `npm run dev`.
