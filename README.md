# SimplePodcast

Plataforma minimalista para publicar un podcast, con CMS embebido, RSS válido para Apple/Spotify y deploy en Cloudflare Workers.

## Stack

- **[Astro 6](https://astro.build/)** — output `server` con adapter `@astrojs/node`.
- **[Keystatic](https://keystatic.com/)** — CMS basado en archivos (Markdown/JSONX en el repo) con UI local.
- **[MDX](https://mdxjs.com/)** — contenido de episodios con componentes.
- **Tailwind CSS v4** — estilos utilitarios.
- **TypeScript** — tipado estricto en schemas.

## Características

- ✏️ **Editor visual** en `/keystatic` para gestionar episodios y config del podcast.
- 📡 **RSS válido** con namespace `itunes` y `podcast` (PSP-1 compliant).
- 🎨 **UI minimalista** con Tailwind: home con hero, lista de episodios con player, página de episodio.
- 🖼️ **Cover con fallback** automático a la portada del podcast si el episodio no tiene.
- 🔗 **Links de suscripción** condicionales a Apple Podcasts, Spotify, YouTube y RSS.
- 🚀 **Deploy en Cloudflare Workers**.

## Quickstart

```sh
# 1. Instalar dependencias
npm install

# 2. Levantar el dev server
npm run dev
# → http://localhost:4321

# 3. Abrir el editor (Keystatic)
# → http://localhost:4321/keystatic
```

Para construir producción:

```sh
npm run build
npm run preview
```

## Configuración

### Singleton del podcast

Editá `src/content/podcast/config.json` (o desde Keystatic) para definir:

| Campo | Descripción |
|---|---|
| `title` | Título del podcast (obligatorio) |
| `description` | Descripción corta (obligatorio) |
| `author` | Nombre del autor (obligatorio) |
| `category` | Categoría iTunes — elegí de las 20 oficiales de Apple |
| `link` | URL pública del podcast (obligatorio) |
| `coverImage` | Portada, 1400–3000 px, <512 KB recomendado |
| `rssItemLimit` | Cantidad máxima de ítems en el feed (default 50) |
| `homeItemsPerPage` | Episodios por página en la home (default 10) |
| `appLanguage` | `es` o `en` |
| `explicit` | `true` o `false` (Apple Podcasts) |
| `applePodcastId` | ID numérico de Apple Podcasts (opcional) |
| `spotifyShowId` | ID del show en Spotify (opcional) |
| `youtubeHandle` | Handle de YouTube sin `@` (opcional) |

### Episodios

Cada episodio vive en `src/content/episodes/<slug>.mdx`. El frontmatter requiere:

```yaml
---
title: Título del episodio
pubDate: 2026-06-07T15:00:00.000Z   # ISO 8601 con hora
status: published                    # draft | published | scheduled
shortDescription: Descripción para SEO
explicit: 'false'                    # 'true' | 'false'
fileSize: 4810552                    # bytes
duration: '00:10:00'                 # formato HH:MM:SS
audioSource:
  url: https://example.com/episode.mp3
imageUrl: /images/episodes/portada.png  # opcional; fallback a cover del podcast
---
Contenido del episodio en MDX...
```

> ⚠️ La URL en `audioSource.url` debe soportar **byte-range requests** (`Accept-Ranges: bytes`) para que Apple Podcasts pueda streamear. Si tu hosting no lo soporta, usá un proxy como [op3.dev](https://op3.dev) o mové los MP3 a Cloudflare R2.

### Cómo editar desde Keystatic

1. Ir a `http://localhost:4321/keystatic` (en dev) o `https://tu-dominio/keystatic` (en producción).
2. **Configuración** → ajustá los datos del podcast.
3. **Episodios** → crear / editar episodios.
4. Cada cambio se persiste como un archivo en el repo (`commit` automático en producción, archivo en disco en dev).

## Estructura del proyecto

```
.
├── astro.config.mjs           # Astro + Tailwind v4 + Keystatic
├── keystatic.config.ts        # Schema del CMS (singleton podcast + colección episodes)
├── src/
│   ├── content/
│   │   ├── podcast/
│   │   │   └── config.json    # Singleton con la config global
│   │   └── episodes/
│   │       └── *.mdx          # Un archivo por episodio
│   ├── content.config.ts      # Schemas de zod para validación
│   ├── layouts/
│   │   └── BaseLayout.astro   # Layout con meta tags, OG, fuentes
│   ├── lib/
│   │   └── images.ts          # Helper de cover con fallback
│   ├── pages/
│   │   ├── index.astro        # Home
│   │   ├── feed.xml.ts        # Generador del RSS
│   │   └── episodes/
│   │       └── [id].astro     # Página de cada episodio
│   └── styles/
│       └── global.css         # Tailwind + tokens custom
└── public/
    ├── images/
    │   ├── podcast/           # Cover del podcast
    │   └── episodes/          # Covers de episodios
    ├── audios/                # (no usado actualmente; MP3s en hosting externo)
    └── favicon.svg
```

## Deploy

El proyecto usa `@astrojs/node` en modo `standalone` y está deployado en Cloudflare Workers. Para deployar:

```sh
npm run build
# → dist/server/entry.mjs (Node entrypoint)
```

Configurá tu plataforma (Cloudflare Pages, Workers, Fly.io, etc.) para servir `dist/`.

### Variables de entorno (futuro)

Cuando se integren features que requieren secretos (API keys de op3, email, etc.):

```sh
# .env (no commitear)
OP3_API_KEY=...
RESEND_API_KEY=...
```

## Roadmap

### Corto plazo

- [ ] **Optimizar cover art** — convertir a WebP/JPG <512 KB manteniendo 3000×3000 px.
- [ ] **Byte-range support** — mover MP3s a Cloudflare R2 o usar op3.dev como proxy para cumplir con Apple Podcasts.
- [ ] **Última milla del feed** — agregar `podcast:locked`, `podcast:guid` y revisar el validador de podba.se (ya incluidos; pendiente validación en producción).

### Mediano plazo

- [ ] **Estadísticas con op3.dev** — integrar el proxy de [OpenPodcast](https://op3.dev) para tracking de descargas, plataforma (Apple/Spotify/web), país y bandwidth. Esto también resuelve byte-range.
- [ ] **Página de stats en Keystatic** — dashboard custom dentro del admin mostrando reproducciones por episodio, plataforma, geográfica, etc.
- [ ] **Notificaciones por email** — al publicar un episodio, enviar email a suscriptores vía Resend/SendGrid. Requiere endpoint público (`/api/subscribe`) y persistencia (D1 o KV).
- [ ] **Suscripción sin redeploy** — mover contenido a una DB (Astro DB / D1) para que las ediciones se reflejen sin necesidad de push + build.
- [ ] **Transcripts** — agregar `<podcast:transcript>` por episodio cuando se generen automáticamente (Whisper o similar).

### Largo plazo

- [ ] **CMS alternativo** — evaluar migración a Payload CMS o Sanity si:
  - Hay co-editores sin acceso al repo.
  - Se necesita workflow de aprobación.
  - El volumen de episodios crece (>30).
- [ ] **Multi-podcast** — soportar varios podcasts desde el mismo deploy, cada uno con su feed y su UI.
- [ ] **Analytics del sitio** — Plausible o Umami para pageviews y engagement del player.

## Licencia

MIT.
