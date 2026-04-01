# Prompterest

![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Plataforma Full-Stack (MVP) para descubrir, documentar y compartir prompts de Inteligencia Artificial. 

Prompterest está desarrollado con un enfoque en rendimiento, seguridad y experiencia de usuario inmersiva (Dark Mode). Utiliza una arquitectura moderna basada en Next.js (App Router) y Supabase para gestionar el ciclo de vida completo de curación de contenido GenAI.

---

## 🏗️ Arquitectura del Sistema

El proyecto separa de forma clara las responsabilidades entre el Frontend y el Backend como servicio (BaaS):

- **Frontend:** Construido con **Next.js 15 (App Router)**. Hace un uso combinado de Server Components para fetching inicial optimizado y Client Components para interacciones reactivas en el navegador. La interfaz de usuario está estilizada íntegramente con Tailwind CSS.
- **Backend:** Gestionado a través de **Supabase (PostgreSQL)**. Provee la capa de autenticación (GoTrue), almacenamiento de objetos (Storage para avatares y multimedia) y una base de datos relacional. La comunicación se realiza mediante el cliente SSR de Supabase y está protegida usando Row Level Security (RLS).

---

## ✨ Estado Actual de Funcionalidades 

### 🔐 Autenticación PKCE
- **Sistema Passwordless:** Implementación de flujos de inicio de sesión mediante Magic Links.
- **Onboarding:** Redirección segura a la ruta `/welcome` e interceptación de errores de creación de cuenta que protegen la enumeración de correos.
- **Gestión de Sesión:** Manejo de estado de autenticación en SSR persistido mediante cookies gestionadas en el Middleware de Next.js.

### 👤 Perfiles de Usuario
- **Personalización:** Modales de edición de perfil reactivos.
- **Subida de Avatares:** Implementación de Dropzone y WebRTC (API Canvas) para permitir captura desde cámara web o carga de archivos locales de forma fluida.

### 🔍 Feed y Búsqueda
- **Diseño Masonry:** Renderizado asimétrico fluido de prompts en el Feed principal.
- **Búsqueda Estándar y Filtros:** Búsqueda de texto integrada interceptada por parámetros URL (`?q=...`), trabajando en conjunto con rutas dinámicas (`/category/[slug]`) para agrupar contenido por "Comunidades".

### 📝 Creación de Prompts
- **Control Multimedia Estricto:** Validación de archivos del lado del cliente y servidor, limitando los videos a un máximo de 30 segundos de duración y tamaño de 15MB, evitando saturación del bucket.
- **Gestión Dinámica de Etiquetas:** Selección múltiple de modelos base de IA (ej. GPT-4, Midjourney) limitados a 5 selecciones únicas por prompt.

---

## 🗄️ Esquema de Base de Datos y Seguridad

El modelo relacional está compuesto principalmente por las siguientes tablas, todas securizadas por políticas RLS:

- `profiles`: Sincronizada automáticamente con `auth.users` al momento del registro. Almacena metadatos públicos como el `username` y `avatar_url`.
- `prompts`: Tabla principal para almacenamiento del contenido, texto generativo, referencias al medio adjunto y el modelo IA empleado.
- `categories`: Entidad estática para la normalización de las agrupaciones de contenido.
- `comments`: **Sistema de comentarios relacional plano** que conecta a los usuarios directamente con los prompts.

**Supabase Storage:**  
Dispone de buckets para `avatars` y `prompt-images`. Ambos tienen políticas de escritura restringidas al UUID del usuario autenticado (`auth.uid() = owner_id`), pero habilitan la configuración de lectura pública para la renderización rápida del lado del cliente.

---

## 🛠️ Guía de Despliegue Local

### Prerrequisitos
- Node.js (v18 o superior)
- Docker Desktop (en ejecución)
- Supabase CLI instalado (`npm i -g supabase`)

### Pasos

1. **Clonar e instalar dependencias:**
   ```bash
   git clone https://github.com/tu-usuario/prompterest.git
   cd prompterest
   npm install
   ```

2. **Inyectar la configuración de correos locales:**  
   Antes de iniciar los contenedores, ve al archivo `supabase/config.toml`, busca la sección `[auth.email]` y asegúrate de que esté habilitada la confirmación obligatoria para poder probar el flujo en local:
   ```toml
   [auth.email]
   enable_confirmations = true
   ```

3. **Levantar Infraestructura Local de Supabase:**
   ```bash
   npx supabase start
   ```
   *Este comando descargará e iniciará los contenedores de Postgres, GoTrue, Inbucket, y Storage; ejecutando automáticamente las migraciones (`supabase/migrations`).*

4. **Configurar Variables de Entorno:**
   El comando anterior imprimirá las credenciales locales de la API. Crea o renombra el archivo `.env.local` y mapea los datos:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
   ```

5. **Arrancar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

6. **Probando el Auth localmente:**
   Los correos de verificación y Magic Links emitidos localmente serán interceptados por **Inbucket**. Puedes verlos abriendo en el navegador:
   `http://localhost:54324`

---

## 🚧 Deuda Técnica y Próximos Pasos (Roadmap)

A medida que el MVP se prepara para escalar, los siguientes componentes técnicos están listados como prioridad:
- **Paginación / Infinite Scroll:** Implementar fetchers por lotes en el Feed para optimizar la carga inicial y evitar cuellos de botella en memoria cuando el volumen de prompts aumente masivamente.
- **Sistema de Guardados (Bookmarks):** Introducir una tabla pivot para que los usuarios puedan archivar prompts favoritos en su propia biblioteca personalizada, aumentando el Core Value de retención de la plataforma.
