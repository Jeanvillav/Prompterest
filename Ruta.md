# Ruta de Desarrollo: Prompterest

## Semana 1: Fase 0 - El Candado de Seguridad (Sincronización y Entorno)
El objetivo de esta semana no es programar nuevas vistas, sino asegurar que tú y tu amigo puedan trabajar en paralelo sin destruir la base de datos del otro.

### Paso 1: Configuración de Supabase CLI (Obligatorio para ambos)
- Instalar Supabase CLI localmente (`npm install supabase --save-dev`).
- Hacer login y vincular el proyecto (`npx supabase login`, `npx supabase link --project-ref [TU_ID]`).
- Extracción: Ejecutar `npx supabase db pull`. Esto crea el directorio `supabase/migrations` con su esquema actual.

### Paso 2: Flujo de Git Estricto
- Nadie empuja código a la rama `main` directamente.
- Crear ramas por funcionalidad (ej. `feature/image-optimization`, `feature/user-profiles`).

### Paso 3: Entorno Local
- Iniciar el motor de Supabase en sus computadoras con Docker (`npx supabase start`). De ahora en adelante, desarrollan contra su base de datos local, no contra producción.

## Semana 2: Fase 1 - Optimización y Deuda Técnica Core
El producto debe ser rápido antes de agregarle peso. Aquí se separan las tareas.

### Dev A (Backend/Datos):
- Crear la primera migración manual: `npx supabase migration new add_blurhash_to_prompts`.
- Añadir la columna `blur_hash TEXT` a la tabla `prompts`.
- Aplicar la migración localmente (`npx supabase db push`).
- Implementar el script de paginación en las consultas a la base de datos (usando `.range(from, to)` en Supabase).

### Dev B (Frontend/UI):
- Implementar una librería ligera en el cliente para generar el blurhash antes de subir la imagen en `prompt-form.tsx`.
- Reemplazar todos los `<img>` por `<Image />` de Next.js. Configurar `next.config.mjs` y pasarle el blurhash como placeholder.
- Implementar `react-intersection-observer` en el Home para habilitar el Infinite Scroll, consumiendo la query paginada que preparó el Dev A.

## Semana 3: Fase 2 - Identidad y Perfiles Reales
Convertir correos anónimos en usuarios con presencia en la red.

### Dev A (Backend/Datos):
- Crear migración: `npx supabase migration new create_profiles_table`.
- Escribir el SQL para crear la tabla `profiles` (conectada a `auth.users`).
- Escribir el Trigger SQL que inserta automáticamente una fila en `profiles` cuando alguien se registra.
- Configurar las políticas RLS (Row Level Security) para que cualquiera pueda leer perfiles, pero solo el dueño pueda editar el suyo.

### Dev B (Frontend/UI):
- Construir la vista `src/app/profile/[username]/page.tsx`.
- Diseñar el "Dashboard" del usuario: Un header con su Avatar, Bio, y una cuadrícula (Grid) reutilizando el componente `prompt-card.tsx` para mostrar solo los prompts de ese autor.
- Modificar el `navbar.tsx` para que el avatar lleve al perfil del usuario logueado.

## Semana 4: Fase 3 - El Motor de Retención (Guardados y Búsqueda Real)
La mecánica tipo Pinterest para guardar contenido y un buscador que funcione con miles de registros.

### Dev A (Backend/Datos):
- Crear migración: `npx supabase migration new add_saved_prompts_and_search`.
- Crear la tabla `saved_prompts` (relación N:M entre usuarios y prompts).
- Crear un índice GIN nativo en PostgreSQL para las columnas `title` y `description` de los prompts.
- Actualizar la función/API de búsqueda para usar Full-Text Search (`.textSearch()`) en lugar del operador básico `.ilike()`.

### Dev B (Frontend/UI):
- Diseñar y programar el componente `save-button.tsx`. Integrarlo en las tarjetas. Debe tener Optimistic UI (cambiar visualmente a "guardado" al instante sin esperar al servidor).
- Añadir un sistema de pestañas (Tabs) en el perfil del usuario: "Mis Prompts" y "Guardados". Conectar la pestaña "Guardados" a la nueva tabla.

## Semana 5: Fase 4 - Pulido, QA y Despliegue a Producción
Nadie programa nuevas funcionalidades esta semana. Es puramente estabilización y lanzamiento.

### Trabajo Conjunto:
- **Merge Final:** Unir todas las ramas de Git en `main`.
- **Migraciones a Producción:** Ejecutar las migraciones en el proyecto de Supabase alojado en la nube (`npx supabase db push --linked`).
- **Variables de Entorno:** Verificar que en Vercel estén correctamente configuradas las variables de producción (`NEXT_PUBLIC_SUPABASE_URL`, etc.).
- **Testing Cruzado:** El Dev A intenta romper la UI del Dev B. El Dev B intenta saltarse la seguridad de la base de datos (ej. intentando borrar un prompt de otro usuario).
- **Despliegue:** Conectar el repositorio a Vercel y hacer el deploy final.
