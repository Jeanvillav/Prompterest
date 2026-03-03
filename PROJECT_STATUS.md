# 🚀 Prompterest - Estado del Proyecto (MVP)

Prompterest es una red social de alto rendimiento diseñada para compartir y descubrir prompts de Inteligencia Artificial. Inspirada en la arquitectura de Pinterest, utiliza un stack moderno para ofrecer una experiencia fluida, segura y escalable.

## 📋 Resumen de Funcionalidades

### 1. Autenticación y Perfiles
- **Supabase Auth**: Sistema completo de registro e inicio de sesión.
- **Auto-perfiles**: Trigger en base de datos que crea automáticamente una entrada en la tabla `profiles` al registrarse un nuevo usuario.
- **Páginas de Perfil**: Visualización dinámica de los prompts creados y guardados por cada usuario.

### 2. Feed y Visualización
- **Masonry Layout**: Interfaz fluida para la exhibición de prompts.
- **Infinite Scroll**: Carga perezosa (Lazy Loading) por lotes de 10 elementos mediante `react-intersection-observer`.
- **Optimización de Imágenes**: Uso de `next/image` con soporte para **Blurhash** (placeholders borrosos) para una percepción de carga instantánea.

### 3. Motor de Búsqueda
- **Full-Text Search (FTS)**: Implementado directamente en PostgreSQL.
- **Índice GIN**: Optimización de consultas de búsqueda sobre vectores de texto (título y descripción).
- **Soporte de Idioma**: Configurado específicamente para búsquedas en español.

### 4. Interacción (Motor de Retención)
- **Bookmarks (Guardados)**: Sistema de guardado de prompts con **Optimistic UI**. El usuario ve el cambio al instante sin esperar al servidor.
- **Persistencia**: Validación de seguridad mediante RLS para asegurar que solo el dueño pueda ver/editar sus guardados.

### 5. Seguridad de Datos
- **Row Level Security (RLS)**: Políticas estrictas en todas las tablas (`prompts`, `profiles`, `saved_prompts`, `comments`).
- **Relaciones Corregidas**: Claves foráneas vinculadas a `public.profiles` para permitir Joins automáticos y seguros vía PostgREST.

---

## 🛠️ Requisitos para Ejecución Local

### Prerrequisitos
- **Node.js**: v18 o superior.
- **Docker Desktop**: Necesario para correr Supabase localmente.
- **Supabase CLI**: Instalado globalmente o vía `npx`.

### Configuración del Entorno (`.env.local`)
Crea un archivo `.env.local` en la raíz con el siguiente formato:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_local
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_local
```

### Pasos para Iniciar
1. **Instalar Dependencias**:
   ```bash
   npm install
   ```
2. **Levantar Base de Datos**:
   ```bash
   npx supabase start
   ```
3. **Aplicar Migraciones y Datos de Prueba**:
   ```bash
   npx supabase db reset
   npx tsx scripts/seed-test-data.ts
   npx tsx scripts/backfill-blurhash.ts
   npx tsx scripts/fix-storage.ts
   ```
4. **Correr Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Arquitectura Técnica
- **Framework**: Next.js 15+ (App Router).
- **Lenguaje**: TypeScript.
- **Estilos**: Tailwind CSS 4.0.
- **Backend-as-a-Service**: Supabase.
- **Base de Datos**: PostgreSQL con extensiones `uuid-ossp` y `pgcrypto`.

## ⚠️ Notas de Mantenimiento
- La optimización de imágenes está en modo `unoptimized: true` en `next.config.ts` para compatibilidad con la IP local de Supabase (`127.0.0.1`). Para producción en Vercel, este flag debe ser evaluado según el plan de optimización de imágenes.
- El bucket de storage `prompt-images` debe ser público para que las URLs generadas funcionen correctamente.
