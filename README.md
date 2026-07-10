# MARE Eventos

Sitio web informativo y sistema de reservaciones para el negocio familiar MARE — servicio de comida para eventos en Aguascalientes.

## Estructura del proyecto

```
MARE/
├── frontend/     # React + Vite (desplegar en Vercel)
├── backend/      # Express + MongoDB (desplegar en Render u otro)
└── logo_mare.jpeg
```

## Requisitos

- Node.js 18+
- MongoDB Atlas (cuenta gratuita)

## Configuración local

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` y el backend en `http://localhost:5000`.

### 3. Primer usuario

El **primer usuario registrado** se convierte automáticamente en administrador.

## Despliegue en producción

> **Importante:** Vercel solo hospeda el **frontend**. El **backend** debe desplegarse por separado (Render, Railway, etc.). Sin backend en producción, el sitio se verá pero login, reservas y contacto no funcionarán.

### Checklist antes de subir

- [ ] Repositorio en GitHub (sin archivos `.env` — ya están en `.gitignore`)
- [ ] MongoDB Atlas configurado (la URI local `127.0.0.1` **no funciona** en producción)
- [ ] `JWT_SECRET` seguro (el mismo en local y producción, o uno nuevo solo para prod)

### Paso 1 — Backend en Render (hazlo primero)

1. Crea cuenta en [Render](https://render.com) y un **Web Service**
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Variables de entorno en Render:

| Variable | Valor |
|----------|-------|
| `MONGODB_URI` | URI de MongoDB Atlas (no uses localhost) |
| `JWT_SECRET` | Tu clave secreta larga |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | URL de Vercel (la agregas después del paso 2) |

5. Despliega y copia la URL del servicio (ej. `https://mare-api.onrender.com`)
6. Verifica: abre `https://tu-api.onrender.com/api/health` — debe responder `{"status":"ok"}`

### Paso 2 — Frontend en Vercel

1. Crea cuenta en [Vercel](https://vercel.com) e importa el repositorio
2. Configuración del proyecto:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite (detectado automáticamente) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

3. Variable de entorno en Vercel:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://tu-api.onrender.com/api` |

4. Despliega y copia la URL (ej. `https://mare.vercel.app`)

### Paso 3 — Conectar frontend y backend

1. En **Render**, actualiza `FRONTEND_URL` con tu URL de Vercel:
   ```
   https://mare.vercel.app
   ```
   Si usas previews de Vercel, puedes poner varias separadas por coma:
   ```
   https://mare.vercel.app,https://mare-git-main-usuario.vercel.app
   ```
2. Redespliega el backend en Render para aplicar el cambio
3. En producción, **regístrate como primer usuario** — será el administrador

### Paso 4 — Verificación final

- [ ] Home carga con carrusel e imágenes
- [ ] Registro e inicio de sesión funcionan
- [ ] Formulario de contacto envía (revisa panel Mensajes del admin)
- [ ] Crear reservación funciona
- [ ] Panel admin visible para el primer usuario registrado

## Funcionalidades

- Página de inicio con carrusel, información del negocio y paquetes
- Formulario de contacto (guarda en BD, visible en panel admin)
- Sistema de reservaciones con detección de conflictos de horario
- Autenticación JWT (sesión de 48 horas)
- Panel de administración: clientes, reservaciones y mensajes
- Diseño responsive con menú hamburguesa en móvil
- Mapa interactivo con OpenStreetMap

## Paleta de colores

- `#050404` — Negro
- `#cca166` — Dorado
- `#e65f17` — Naranja
- `#914721` — Café
- `#ba491d` — Óxido
- `#dba83d` — Amarillo dorado

## Contacto del negocio

- **Dirección:** AV DE LA CONVENCION PTE 1914 #1610, LA CONCORDIA. AGUASCALIENTES, AGS.
- **WhatsApp:** 449 173 7681
- **Teléfono:** 449 913 5323
- **Correo:** mare.eventos.pro@gmail.com
