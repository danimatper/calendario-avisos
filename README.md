# Calendario de Avisos

Aplicación web para gestionar fechas de trámites importantes y recibir avisos automáticos antes de que venzan, enviados por Telegram. Acceso protegido con autenticación de usuarios.

## El problema que resuelve

En el día a día es fácil que se pasen fechas de trámites importantes (renovaciones, vencimientos de contratos, plazos administrativos). Esta aplicación centraliza esas fechas en un calendario y, mediante un cron, envía un recordatorio automático con la antelación que elijas, para no depender de la memoria ni de revisar el calendario manualmente.

> El canal de aviso es Telegram, pero al estar basado en una simple llamada a una API, podría adaptarse fácilmente a **WhatsApp** (vía su API/Business API) u otros canales, cambiando solo la función de envío.

*(La historia completa y las decisiones de diseño se desarrollan en mi portafolio web.)*

## Stack

- **Next.js 16** (App Router, API Routes, middleware)
- **React 19** + TypeScript
- **Supabase** (PostgreSQL + Auth) como base de datos y autenticación
- **@supabase/ssr** para sesiones con cookies en servidor y cliente
- **Telegram Bot API** para las notificaciones
- **Vercel** para el despliegue y el cron job
- **date-fns** para el manejo de fechas
- **Vitest** para los tests

## Autenticación y seguridad

- Acceso protegido con **Supabase Auth** (email + contraseña). Un middleware redirige a `/login` a quien no haya iniciado sesión.
- Las rutas de la API comprueban la sesión del usuario y operan bajo las **políticas RLS** de Supabase: solo usuarios autenticados pueden leer o escribir.
- El endpoint del cron está protegido aparte con un `CRON_SECRET` (lo llama Vercel, no un usuario).

---

## Configuración paso a paso

### 1. Crear el Bot de Telegram

1. Abre Telegram y busca **@BotFather**
2. Escribe `/newbot` y sigue los pasos (ponle un nombre y un username)
3. Copia el **token** que te da (formato: `123456789:ABCdef...`)
4. Crea un grupo en Telegram y añade el bot como miembro
5. Envía un mensaje al grupo, luego abre en el navegador:
   ```
   https://api.telegram.org/bot<TU_TOKEN>/getUpdates
   ```
6. Busca `"chat":{"id":` en la respuesta — ese número es el **Chat ID** (puede ser negativo, ej: `-1001234567890`)

### 2. Crear la base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta el contenido del archivo `supabase-schema.sql`
4. En **Authentication → Users**, crea el usuario o usuarios que podrán acceder
5. Ve a **Settings → API** y copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (solo la usa el cron)

### 3. Variables de entorno

Copia `.env.example` a `.env.local` y rellena tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

TELEGRAM_BOT_TOKEN=123456789:ABCdef...
TELEGRAM_CHAT_ID=-1001234567890

CRON_SECRET=pon_aqui_una_cadena_aleatoria_larga
```

### 4. Desplegar en Vercel

1. Sube el proyecto a GitHub (repositorio nuevo)
2. Ve a [vercel.com](https://vercel.com), conecta tu cuenta de GitHub
3. Importa el repositorio
4. En **Environment Variables**, añade todas las variables del paso 3
5. Despliega — Vercel detectará automáticamente que es Next.js

El cron job (`vercel.json`) ya está configurado para ejecutarse **cada hora** y comprobar si hay avisos pendientes.

---

## Cómo funciona

- **Login**: solo los usuarios dados de alta en Supabase pueden entrar
- **Calendario**: haz clic en cualquier día para crear un evento
- **Modal**: introduce título, descripción, fecha/hora y cuánto tiempo antes quieres el aviso
- **Telegram**: cuando llegue el momento del aviso, el bot manda un mensaje al grupo automáticamente
- El aviso se manda **una sola vez** por evento (campo `notified`)

## Estructura del proyecto

```
middleware.ts            <- Protege las rutas (redirige a /login sin sesión)
app/
  page.tsx               <- Página principal (calendario)
  login/page.tsx         <- Pantalla de inicio de sesión
  api/
    events/route.ts      <- GET todos / POST nuevo (requieren sesión)
    events/[id]/route.ts <- PUT editar / DELETE eliminar (requieren sesión)
    cron/route.ts        <- Cron job (comprueba y manda avisos)
components/
  Calendar.tsx           <- Vista mensual del calendario
  EventModal.tsx         <- Modal para crear/editar eventos
  LogoutButton.tsx       <- Botón de cerrar sesión
lib/
  supabase-server.ts     <- Cliente Supabase de servidor (cookies)
  supabase-browser.ts    <- Cliente Supabase de navegador
  supabase.ts            <- Cliente service-role (solo cron) + tipos
  telegram.ts            <- Función para mandar mensajes
  reminders.ts           <- Lógica de cuándo disparar cada aviso
  categories.ts          <- Categorías y colores
supabase-schema.sql      <- SQL: tabla + políticas RLS
vercel.json              <- Configuración del cron (cada hora)
tests/                   <- Tests con Vitest
```

## Tests

La lógica pura (cálculo de cuándo disparar cada aviso y asignación de colores por categoría) está cubierta con tests usando **Vitest**:

```bash
npm install
npm test
```
