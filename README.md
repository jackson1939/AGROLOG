# 🌾 AgroLog

**Ecosistema de inteligencia agrícola con diagnóstico foliar por IA y marketplace de insumos para productores de Santa Cruz, Bolivia.**
**Agricultural intelligence ecosystem with AI-powered leaf diagnosis and a supply marketplace for producers in Santa Cruz, Bolivia.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.18-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4)](https://ai.google.dev/)

**Idioma / Language:** [Español](#español) · [English](#english)

---

<a name="español"></a>
## 🇪🇸 Español

### Descripción general

**AgroLog** (también referido en el código como parte del "ecosistema EnerCruz") es una aplicación web construida para agrónomos y cooperativas agrícolas del departamento de Santa Cruz, Bolivia. Nació como proyecto de hackathon/pitch (existe un `business_model.md` orientado a jurado) y su objetivo es resolver un problema real del agro cruceño: los agrónomos de campo necesitan registrar visitas a parcelas, diagnosticar plagas y enfermedades foliares, y conectar esos diagnósticos con la compra de insumos, todo esto muchas veces **sin conectividad estable** en zonas rurales.

La plataforma unifica tres roles de trabajo:

- **Agrónomos/Productores**: registran parcelas, hacen bitácoras de visitas de campo (con fotos, fenología, severidad, clima) y solicitan diagnósticos por IA.
- **Administradores/Supervisores**: revisan un canal de "comunidad" (difusión) con reportes fotográficos enviados por productores y disparan el análisis de IA sobre ellos.
- **Proveedores locales** (Mainter, CAICO, Interagro, etc.): aparecen sugeridos automáticamente en el marketplace cuando la IA detecta una plaga o deficiencia específica.

> **Nota de madurez del proyecto**: por el contenido de `business_model.md` y del propio código (datos de demostración, modelo mock cuando falta la API key, credenciales hardcodeadas de ejemplo), este es un **MVP/prototipo de hackathon**, no un sistema en producción con datos reales de clientes. Se recomienda tratarlo como tal antes de cualquier despliegue comercial.

### Características principales

- **Gestión de parcelas (lotes)**: alta, edición y listado de parcelas con cultivo, superficie, productor, municipio/departamento y ubicación geográfica (lat/lng + polígono opcional), visualizadas en un mapa interactivo con Leaflet.
- **Bitácora de visitas de campo**: registro de visitas por parcela con fecha, fenología, observaciones, severidad (`BAJA`/`MEDIA`/`ALTA`/`CRITICA`), fotos, temperatura/humedad, producto aplicado, dosis y seguimiento.
- **Captura de fotos in-situ**: componente de cámara (`useCamera`, `FotoCapture`) para adjuntar evidencia fotográfica directamente desde el navegador/móvil.
- **Diagnóstico foliar con IA multimodal (Google Gemini)**: envío de una foto de campo al modelo `gemini-1.5-flash-latest`, que devuelve hasta 3 hipótesis de diagnóstico (enfermedad, plaga, deficiencia, fisiológico o normal) con nivel de confianza, síntomas, acción recomendada, urgencia y riesgo económico estimado. Si no hay `GEMINI_API_KEY` configurada, el sistema cae automáticamente en un **modo demo con respuesta simulada** (ver `lib/gemini.ts`).
- **Canal de comunidad / difusión**: feed de publicaciones (posible reporte de plagas) que un administrador puede analizar con IA para emitir un veredicto y una recomendación fitosanitaria.
- **Marketplace de insumos**: a partir del diagnóstico, se sugieren productos y servicios (fungicidas, herbicidas, fertilizantes, fumigación con drones, sensores IoT) de proveedores reales de Santa Cruz, con un flujo simulado de "compra en 1 clic" y un modelo de negocio de comisión (3–5% por transacción, documentado en `business_model.md`).
- **Alertas climáticas**: integración con la API pública **Open-Meteo** (`lib/clima.ts`) para pronóstico a 7 días y alertas automáticas de helada, sequía y viento fuerte según la ubicación de cada parcela.
- **Informes en PDF**: generación de reportes (fitosanitario, mensual, por parcela o por campaña) usando `@react-pdf/renderer`, con configuración y previsualización antes de exportar.
- **Funcionamiento offline-first (PWA)**: Service Worker (`public/sw.js`) con caché de rutas clave, cola de sincronización (`lib/offline/queue.ts`, `lib/offline/sync.ts`) y almacenamiento local con IndexedDB (`idb`) para registrar visitas sin señal y sincronizarlas automáticamente al recuperar conexión (`useOffline`, `SyncIndicator`).
- **Autenticación y roles**: login con credenciales (email/contraseña) vía **NextAuth.js v5**, contraseñas con `bcryptjs`, sesiones JWT y roles `AGRONOMO`, `SUPERVISOR`, `ADMIN`; rutas protegidas por middleware.
- **Internacionalización nativa**: selector de idioma con soporte para **Español**, **Bésiro (Chiquitano)** y **Guaraní** (`lib/language.tsx`), pensado para comunidades originarias de Santa Cruz.
- **Dashboard con estadísticas**: tarjetas de resumen (parcelas totales, visitas del mes, diagnósticos, informes), gráficos interactivos (Recharts) y actividad reciente.
- **UI premium con animaciones**: diseño con Tailwind CSS, componentes propios (`Button`, `Card`, `Modal`, `Toast`, `Badge`, etc.), animaciones con **Framer Motion** y **GSAP**, y fondo interactivo animado en el layout del dashboard.

### Stack tecnológico

**Framework y lenguaje**
- [Next.js 14.2.18](https://nextjs.org/) (App Router, Route Handlers, Server Actions)
- [React 18.3](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) (`strict: true`)
- [Tailwind CSS 3.4](https://tailwindcss.com/) + `tailwind-merge`, `clsx`

**Backend y datos**
- [Prisma ORM 5.22](https://www.prisma.io/) sobre **PostgreSQL** (pensado para [Neon](https://neon.tech/) en producción)
- [NextAuth.js v5 (beta)](https://authjs.dev/) con proveedor de credenciales
- [Zod 3](https://zod.dev/) + `react-hook-form` + `@hookform/resolvers` para validación de formularios
- [Zustand 4](https://zustand-demo.pmnd.rs/) para estado global (sync, parcelas, visitas)

**Inteligencia artificial**
- [`@google/generative-ai`](https://ai.google.dev/) — Google Gemini 1.5 Flash para análisis visual multimodal (diagnóstico fitosanitario y filtro de spam en el canal de comunidad)

**Mapas, clima y reportes**
- [Leaflet](https://leafletjs.com/) + `react-leaflet` para mapas de parcelas
- API pública [Open-Meteo](https://open-meteo.com/) para pronóstico del clima
- [`@react-pdf/renderer`](https://react-pdf.org/) para generación de informes PDF
- [Recharts](https://recharts.org/) para gráficos del dashboard

**Offline / PWA**
- Service Worker nativo (`public/sw.js`) + `public/manifest.json`
- [`idb`](https://github.com/jakearchibald/idb) (IndexedDB) para persistencia local y cola de sincronización

**Animación y UX**
- [Framer Motion](https://www.framer.com/motion/) y [GSAP](https://gsap.com/) (con `@gsap/react`)
- [Sonner](https://sonner.emilkowal.ski/) para notificaciones tipo toast
- [Lucide React](https://lucide.dev/) para iconografía

**Infraestructura de almacenamiento**
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) para almacenamiento de fotos subidas

### Arquitectura / estructura de carpetas

```
agrolog/
├── app/                        # Next.js App Router
│   ├── (auth)/login/           # Ruta pública de login
│   ├── (dashboard)/            # Rutas protegidas del panel principal
│   │   ├── dashboard/          # Resumen general y estadísticas
│   │   ├── parcelas/           # CRUD de parcelas + detalle + bitácora
│   │   ├── campo/              # Registro de visitas de campo
│   │   ├── diagnostico/        # Subida de fotos y diagnóstico con IA
│   │   ├── comunidad/          # Canal de difusión/reportes comunitarios
│   │   ├── informes/           # Generación y listado de informes PDF
│   │   └── configuracion/      # Ajustes de usuario
│   └── api/                    # Route Handlers (REST interno):
│       ├── auth/[...nextauth]  # Autenticación (NextAuth)
│       ├── parcelas/           # CRUD de parcelas
│       ├── visitas/            # CRUD de visitas
│       ├── diagnostico/        # Endpoint de análisis con Gemini
│       ├── comunidad/          # Feed y análisis de reportes comunitarios
│       ├── informes/           # Generación de informes
│       ├── clima/              # Proxy a Open-Meteo
│       └── sync/               # Sincronización de datos offline
├── components/                 # Componentes React organizados por dominio
│   ├── campo/                  # Cámara, formularios y timeline de visitas
│   ├── dashboard/               # Tarjetas de stats, gráficos, alertas de clima
│   ├── diagnostico/             # Uploader, tarjetas de diagnóstico, marketplace
│   ├── informes/                 # Configuración, preview y render de PDF
│   ├── parcelas/                # Tarjetas, formulario y mapa de parcelas
│   ├── layout/                  # Header, Sidebar, navegación móvil, selector de idioma
│   ├── animations/               # Wrappers de animación reutilizables
│   └── ui/                       # Componentes base (Button, Card, Modal, Toast, etc.)
├── hooks/                       # useGPS, useCamera, useDiagnostico, useGSAP, useOffline
├── lib/                         # Lógica de negocio y utilidades
│   ├── auth.ts                  # Configuración de NextAuth
│   ├── gemini.ts                 # Cliente e integración con Gemini Vision
│   ├── clima.ts                  # Integración con Open-Meteo
│   ├── prisma.ts                  # Cliente Prisma singleton
│   ├── language.tsx               # Contexto de internacionalización (ES/Bésiro/Guaraní)
│   ├── offline/                   # db.ts, queue.ts, sync.ts — persistencia y sync offline
│   ├── pdf/                        # Generación de reportes PDF
│   └── validations/                 # Esquemas Zod por entidad
├── store/                        # Estados globales con Zustand (sync, parcelas, visitas)
├── prisma/
│   ├── schema.prisma               # Modelo de datos (User, Parcela, Visita, Diagnostico, Informe, DifusionPost)
│   └── seed.ts                     # Script de siembra con datos y usuarios demo
├── types/                         # Tipos TypeScript compartidos
├── public/                        # Manifest PWA, Service Worker, íconos
├── middleware.ts                   # Protección de rutas del dashboard
├── business_model.md                # Documento de modelo de negocio (pitch)
└── next.config.js / tailwind.config.ts / tsconfig.json
```

### Modelo de datos (resumen)

Definido en `prisma/schema.prisma`, con **PostgreSQL** como motor:

- `User` (roles `AGRONOMO` / `SUPERVISOR` / `ADMIN`)
- `Parcela` (cultivos: `SOYA`, `MAIZ`, `QUINUA`, `PAPA`, `TRIGO`, `GIRASOL`, `CITRICOS`, `TOMATE`, `CEBOLLA`, `OTRO`)
- `Visita` (con severidad `BAJA`/`MEDIA`/`ALTA`/`CRITICA`, soporte para registros offline vía `offlineId`)
- `Diagnostico` (resultado de IA con hipótesis en JSON)
- `Informe` (tipos `FITOSANITARIO`, `MENSUAL`, `PARCELA`, `CAMPANA`)
- `DifusionPost` (canal de comunidad, estado `PENDIENTE`/`ANALIZADO`)

### Requisitos previos

- **Node.js** 18.18+ o 20+ (requerido por Next.js 14)
- **npm** (el repo incluye `package-lock.json`)
- Una base de datos **PostgreSQL** accesible (recomendado: [Neon](https://neon.tech/) — plan gratuito disponible)
- Una **API key de Google Gemini** (opcional para desarrollo: sin ella, el diagnóstico usa datos simulados) — obtenible gratis en [Google AI Studio](https://aistudio.google.com/)
- Un token de **Vercel Blob** si se desea probar la subida real de fotos (opcional en desarrollo local)

### Instalación y configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/jackson1939/AGROLOG.git
cd AGROLOG

# 2. Instalar dependencias
npm install
```

> El `postinstall` del proyecto limpia el caché de Prisma y ejecuta `prisma generate` automáticamente tras `npm install`.

Crear un archivo **`.env.local`** en la raíz (podés basarte en `.env.local.example`, incluido en el repo):

```env
# Base de datos (PostgreSQL — recomendado Neon)
DATABASE_URL="postgresql://usuario:password@host/db?sslmode=require"
DIRECT_URL="postgresql://usuario:password@host/db?sslmode=require"

# Autenticación (NextAuth.js v5)
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="generar-con-openssl-rand-base64-32"

# Google Gemini (opcional en desarrollo: sin esto se usa un diagnóstico simulado)
GEMINI_API_KEY="AIza..."

# Vercel Blob (opcional, para subida real de fotos)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Sincronizar el esquema de la base de datos y sembrar datos de demostración:

```bash
# Aplica el esquema de Prisma a la base de datos configurada
npm run db:push

# Crea usuarios y parcelas de demostración
npm run db:seed
```

### Uso / cómo correr el proyecto

```bash
# Modo desarrollo (http://localhost:3000)
npm run dev

# Build de producción
npm run build

# Levantar el build de producción
npm start

# Lint
npm run lint
```

**Credenciales de demostración** (creadas por `prisma/seed.ts`):

| Rol | Email | Contraseña |
|---|---|---|
| Agrónomo/Productor | `demo@agrolog.bo` | `campo2024` |
| Administrador Central | `admin@agrolog.bo` | `admin2024` |

> ⚠️ Estas credenciales son solo para demo/desarrollo local. Cambiá o eliminá estos usuarios antes de cualquier uso con datos reales.

### Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión a PostgreSQL (pooled, usada por Prisma Client en runtime) |
| `DIRECT_URL` | Sí | Cadena de conexión directa a PostgreSQL (usada por Prisma para migraciones) |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Sí | Secreto para firmar sesiones JWT de NextAuth |
| `NEXTAUTH_URL` | Sí (en algunos entornos) | URL base de la app para callbacks de auth |
| `GEMINI_API_KEY` | Opcional | Habilita el diagnóstico real con Google Gemini; si falta, se usa un mock |
| `BLOB_READ_WRITE_TOKEN` | Opcional | Habilita subida real de imágenes a Vercel Blob |
| `NEXT_PUBLIC_APP_URL` | Opcional | URL pública de la app, expuesta al cliente |

### Estado del proyecto / roadmap

- **Estado actual**: MVP funcional orientado a demo/pitch, con datos y flujos de negocio simulados en el marketplace (los "proveedores" y precios son ilustrativos, no una integración real de e-commerce/pagos).
- El propio repositorio documenta en `business_model.md` un pivot estratégico ("AgroLog v2.0") desde una idea previa de energía (CRE/Smart Grid) hacia el enfoque agrícola actual.
- Áreas señaladas para evolucionar hacia producción (no confirmadas como implementadas):
  - Integración real de pagos/checkout en el marketplace (hoy es un flujo simulado).
  - Traducciones completas para Bésiro y Guaraní (la infraestructura de i18n existe; conviene auditar cobertura de claves).
  - Gestión de secretos y credenciales de demo antes de cualquier despliegue público.
  - Cobertura de tests automatizados (no se encontró suite de tests en el repo al momento de este README).

### Licencia

No se encontró un archivo `LICENSE` en este repositorio. Por lo tanto:

**Todos los derechos reservados — proyecto privado de jackson1939.**

Si el autor desea publicar el proyecto bajo una licencia open source (MIT, Apache 2.0, etc.), se recomienda agregar un archivo `LICENSE` explícito en la raíz del repositorio.

### Autor / contacto

- **GitHub**: [@jackson1939](https://github.com/jackson1939)
- **Equipo mencionado en el código**: EnerCruz Tech (Amira, Carlos Mendoza y colaboradores adicionales, según `README` original del proyecto)

---

<a name="english"></a>
## 🇬🇧 English

### Overview

**AgroLog** (also referred to in the codebase as part of the "EnerCruz ecosystem") is a web application built for agronomists and agricultural cooperatives in the Santa Cruz department of Bolivia. It originated as a hackathon/pitch project (the repo includes a `business_model.md` written for a judging panel) and targets a real problem in that region's agriculture sector: field agronomists need to log farm-plot visits, diagnose foliar pests and diseases, and connect those diagnoses to purchasing the right supplies — frequently **without stable internet connectivity** in rural areas.

The platform unifies three working roles:

- **Agronomists/Producers**: register plots ("parcelas"), keep field-visit logbooks (photos, phenology, severity, weather), and request AI-based diagnoses.
- **Administrators/Supervisors**: review a "community" broadcast channel with photo reports submitted by producers, and trigger AI analysis on them.
- **Local suppliers** (Mainter, CAICO, Interagro, etc.): are automatically surfaced in the marketplace whenever the AI detects a specific pest or nutrient deficiency.

> **Maturity note**: based on `business_model.md` and the code itself (seeded demo data, a mock AI fallback when no API key is set, hardcoded demo credentials), this is a **hackathon MVP/prototype**, not a production system handling real customer data. Treat it accordingly before any commercial deployment.

### Key features

- **Plot ("parcela") management**: create, edit and list plots with crop type, area, producer, municipality/department and geolocation (lat/lng + optional polygon), displayed on an interactive Leaflet map.
- **Field visit logbook**: log visits per plot with date, phenology stage, notes, severity (`BAJA`/`MEDIA`/`ALTA`/`CRITICA`), photos, min/max temperature, humidity, applied product, dosage and follow-up notes.
- **In-field photo capture**: camera component (`useCamera`, `FotoCapture`) to attach photographic evidence directly from the browser/mobile device.
- **AI-powered multimodal leaf diagnosis (Google Gemini)**: sends a field photo to `gemini-1.5-flash-latest`, which returns up to 3 ranked hypotheses (disease, pest, nutrient deficiency, physiological issue, or normal) with a confidence score, observed symptoms, a recommended action, urgency level and estimated economic risk. If `GEMINI_API_KEY` is not set, the system automatically falls back to a **simulated demo response** (see `lib/gemini.ts`).
- **Community/broadcast channel**: a feed of submitted reports (potential pest sightings) an administrator can run through AI to get a verdict and phytosanitary recommendation.
- **Supply marketplace**: based on a diagnosis, the app suggests products and services (fungicides, herbicides, fertilizers, drone spraying, IoT sensors) from real Santa Cruz-based suppliers, with a simulated "1-click purchase" flow and a commission-based business model (3–5% per transaction, documented in `business_model.md`).
- **Weather alerts**: integration with the public **Open-Meteo** API (`lib/clima.ts`) for a 7-day forecast and automatic frost, drought and high-wind alerts based on each plot's location.
- **PDF reports**: generation of reports (phytosanitary, monthly, per-plot or per-campaign) using `@react-pdf/renderer`, with configuration and preview before exporting.
- **Offline-first PWA**: a Service Worker (`public/sw.js`) caching key routes, an offline sync queue (`lib/offline/queue.ts`, `lib/offline/sync.ts`) and local persistence via IndexedDB (`idb`) so field visits can be logged with no signal and synced automatically once connectivity returns (`useOffline`, `SyncIndicator`).
- **Authentication and roles**: credentials-based login (email/password) via **NextAuth.js v5**, passwords hashed with `bcryptjs`, JWT sessions, and `AGRONOMO`, `SUPERVISOR`, `ADMIN` roles; protected routes enforced by middleware.
- **Native internationalization**: a language switcher supporting **Spanish**, **Bésiro (Chiquitano)** and **Guaraní** (`lib/language.tsx`), aimed at Indigenous communities in Santa Cruz.
- **Statistics dashboard**: summary cards (total plots, visits this month, diagnoses, reports), interactive charts (Recharts) and recent activity.
- **Polished UI with animation**: Tailwind CSS design, custom components (`Button`, `Card`, `Modal`, `Toast`, `Badge`, etc.), **Framer Motion** and **GSAP** animations, and an animated interactive background on the dashboard layout.

### Tech stack

**Framework & language**
- [Next.js 14.2.18](https://nextjs.org/) (App Router, Route Handlers, Server Actions)
- [React 18.3](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) (`strict: true`)
- [Tailwind CSS 3.4](https://tailwindcss.com/) + `tailwind-merge`, `clsx`

**Backend & data**
- [Prisma ORM 5.22](https://www.prisma.io/) on **PostgreSQL** (designed for [Neon](https://neon.tech/) in production)
- [NextAuth.js v5 (beta)](https://authjs.dev/) with a credentials provider
- [Zod 3](https://zod.dev/) + `react-hook-form` + `@hookform/resolvers` for form validation
- [Zustand 4](https://zustand-demo.pmnd.rs/) for global state (sync, plots, visits)

**Artificial intelligence**
- [`@google/generative-ai`](https://ai.google.dev/) — Google Gemini 1.5 Flash for multimodal visual analysis (phytosanitary diagnosis and spam filtering on the community channel)

**Maps, weather & reporting**
- [Leaflet](https://leafletjs.com/) + `react-leaflet` for plot maps
- Public [Open-Meteo](https://open-meteo.com/) API for weather forecasting
- [`@react-pdf/renderer`](https://react-pdf.org/) for PDF report generation
- [Recharts](https://recharts.org/) for dashboard charts

**Offline / PWA**
- Native Service Worker (`public/sw.js`) + `public/manifest.json`
- [`idb`](https://github.com/jakearchibald/idb) (IndexedDB) for local persistence and the sync queue

**Animation & UX**
- [Framer Motion](https://www.framer.com/motion/) and [GSAP](https://gsap.com/) (with `@gsap/react`)
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications
- [Lucide React](https://lucide.dev/) for icons

**Storage infrastructure**
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for storing uploaded photos

### Architecture / folder structure

```
agrolog/
├── app/                        # Next.js App Router
│   ├── (auth)/login/           # Public login route
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── dashboard/          # Overview and stats
│   │   ├── parcelas/           # Plot CRUD + detail + logbook
│   │   ├── campo/              # Field visit logging
│   │   ├── diagnostico/        # Photo upload and AI diagnosis
│   │   ├── comunidad/          # Community broadcast/report channel
│   │   ├── informes/           # PDF report generation and listing
│   │   └── configuracion/      # User settings
│   └── api/                    # Internal REST route handlers:
│       ├── auth/[...nextauth]  # Authentication (NextAuth)
│       ├── parcelas/           # Plot CRUD
│       ├── visitas/            # Visit CRUD
│       ├── diagnostico/        # Gemini analysis endpoint
│       ├── comunidad/          # Community feed and analysis
│       ├── informes/           # Report generation
│       ├── clima/              # Open-Meteo proxy
│       └── sync/               # Offline data sync
├── components/                 # React components organized by domain
│   ├── campo/                  # Camera, forms and visit timeline
│   ├── dashboard/               # Stat cards, charts, weather alerts
│   ├── diagnostico/             # Uploader, diagnosis cards, marketplace
│   ├── informes/                 # PDF configuration, preview and render
│   ├── parcelas/                # Plot cards, form and map
│   ├── layout/                  # Header, sidebar, mobile nav, language selector
│   ├── animations/               # Reusable animation wrappers
│   └── ui/                       # Base components (Button, Card, Modal, Toast, etc.)
├── hooks/                       # useGPS, useCamera, useDiagnostico, useGSAP, useOffline
├── lib/                         # Business logic and utilities
│   ├── auth.ts                  # NextAuth configuration
│   ├── gemini.ts                 # Gemini Vision client and integration
│   ├── clima.ts                  # Open-Meteo integration
│   ├── prisma.ts                  # Prisma client singleton
│   ├── language.tsx               # i18n context (ES/Bésiro/Guaraní)
│   ├── offline/                   # db.ts, queue.ts, sync.ts — offline persistence and sync
│   ├── pdf/                        # PDF report generation
│   └── validations/                 # Zod schemas per entity
├── store/                        # Zustand global stores (sync, plots, visits)
├── prisma/
│   ├── schema.prisma               # Data model (User, Parcela, Visita, Diagnostico, Informe, DifusionPost)
│   └── seed.ts                     # Seed script with demo users and data
├── types/                         # Shared TypeScript types
├── public/                        # PWA manifest, Service Worker, icons
├── middleware.ts                   # Dashboard route protection
├── business_model.md                # Business model document (pitch)
└── next.config.js / tailwind.config.ts / tsconfig.json
```

### Data model (summary)

Defined in `prisma/schema.prisma`, running on **PostgreSQL**:

- `User` (roles: `AGRONOMO` / `SUPERVISOR` / `ADMIN`)
- `Parcela` (crops: `SOYA`, `MAIZ`, `QUINUA`, `PAPA`, `TRIGO`, `GIRASOL`, `CITRICOS`, `TOMATE`, `CEBOLLA`, `OTRO`)
- `Visita` (severity `BAJA`/`MEDIA`/`ALTA`/`CRITICA`, supports offline records via `offlineId`)
- `Diagnostico` (AI result with hypotheses stored as JSON)
- `Informe` (types `FITOSANITARIO`, `MENSUAL`, `PARCELA`, `CAMPANA`)
- `DifusionPost` (community channel, status `PENDIENTE`/`ANALIZADO`)

### Prerequisites

- **Node.js** 18.18+ or 20+ (required by Next.js 14)
- **npm** (the repo ships a `package-lock.json`)
- An accessible **PostgreSQL** database (recommended: [Neon](https://neon.tech/) — free tier available)
- A **Google Gemini API key** (optional in development: without it, diagnosis falls back to simulated data) — get one free at [Google AI Studio](https://aistudio.google.com/)
- A **Vercel Blob** token if you want to test real photo uploads (optional in local development)

### Installation and setup

```bash
# 1. Clone the repository
git clone https://github.com/jackson1939/AGROLOG.git
cd AGROLOG

# 2. Install dependencies
npm install
```

> The project's `postinstall` script clears the Prisma cache and runs `prisma generate` automatically after `npm install`.

Create a **`.env.local`** file at the project root (you can base it on the included `.env.local.example`):

```env
# Database (PostgreSQL — Neon recommended)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
DIRECT_URL="postgresql://user:password@host/db?sslmode=require"

# Authentication (NextAuth.js v5)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google Gemini (optional in development: without it, diagnosis is simulated)
GEMINI_API_KEY="AIza..."

# Vercel Blob (optional, for real photo uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Sync the database schema and seed demo data:

```bash
# Apply the Prisma schema to the configured database
npm run db:push

# Create demo users and plots
npm run db:seed
```

### Usage / running the project

```bash
# Development mode (http://localhost:3000)
npm run dev

# Production build
npm run build

# Run the production build
npm start

# Lint
npm run lint
```

**Demo credentials** (created by `prisma/seed.ts`):

| Role | Email | Password |
|---|---|---|
| Agronomist/Producer | `demo@agrolog.bo` | `campo2024` |
| Central Administrator | `admin@agrolog.bo` | `admin2024` |

> ⚠️ These credentials are for demo/local development only. Change or remove these users before any use with real data.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooled, used by Prisma Client at runtime) |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection string (used by Prisma for migrations) |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Yes | Secret used to sign NextAuth JWT sessions |
| `NEXTAUTH_URL` | Yes (in some environments) | Base app URL for auth callbacks |
| `GEMINI_API_KEY` | Optional | Enables real diagnosis via Google Gemini; falls back to a mock if unset |
| `BLOB_READ_WRITE_TOKEN` | Optional | Enables real image uploads to Vercel Blob |
| `NEXT_PUBLIC_APP_URL` | Optional | Public app URL exposed to the client |

### Project status / roadmap

- **Current status**: a functional MVP built for demo/pitch purposes, with simulated business flows in the marketplace (the listed "suppliers" and prices are illustrative, not a real e-commerce/payments integration).
- The repository itself documents, in `business_model.md`, a strategic pivot ("AgroLog v2.0") from an earlier energy-sector idea (CRE/Smart Grid) to the current agricultural focus.
- Areas flagged for evolving toward production (not confirmed as implemented):
  - Real payment/checkout integration in the marketplace (currently a simulated flow).
  - Complete translations for Bésiro and Guaraní (the i18n infrastructure exists; key coverage should be audited).
  - Proper secrets management and removal of demo credentials before any public deployment.
  - Automated test coverage (no test suite was found in the repo at the time of writing this README).

### License

No `LICENSE` file was found in this repository. Therefore:

**All rights reserved — private project by jackson1939.**

If the author wishes to publish this project under an open-source license (MIT, Apache 2.0, etc.), an explicit `LICENSE` file should be added at the repository root.

### Author / contact

- **GitHub**: [@jackson1939](https://github.com/jackson1939)
- **Team credited in the code**: EnerCruz Tech (Amira, Carlos Mendoza and additional collaborators, per the project's original README)
