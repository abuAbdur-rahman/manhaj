# Manhaj — *Ilm, organized.*

Audio lecture platform for Nigerian Sunni/Salafi scholars — primarily Yoruba-speaking — and their followers. A curated, organized, offline-capable library tied to specific scholars the community already trusts.

## Problem

Nigerian Salafi/Sunni scholar content is scattered across WhatsApp, YouTube, Facebook, and Telegram. No single place exists to find all of a specific scholar's lectures organized by series. Existing platforms are not mobile-optimized, lack offline support, and don't handle Nigeria's data/power constraints.

## MVP Features

- **Scholar profiles** — name, photo, bio, languages, social links
- **Lecture library** — Scholar → Series → Episodes hierarchy; browse, filter by language
- **Audio player** — play/pause/seek, speed control (0.75–2x), sleep timer, background playback, persistent mini-player
- **Offline download** — download lectures to device, play without internet (#1 differentiator)
- **Search** — by title, scholar, series, tags; instant/debounced
- **Share** — shareable links per lecture, WhatsApp one-tap, Open Graph preview
- **Admin CMS** — individual logins, two roles: super_admin (full access), scholar_admin (scoped to one scholar)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16.2.9 (App Router, Turbopack), React 19.2.4, TypeScript 5+ |
| Styling | Tailwind CSS v4 (CSS-based config) |
| Audio Player | Howler.js / HTML5 Audio |
| Backend / DB | Supabase (Postgres + Auth) |
| File Storage | Cloudflare R2 (S3-compatible) |
| Deployment | Vercel |
| Search | Postgres full-text search (`pg_trgm`) |
| PWA | Serwist |
| State | Zustand |
| Lint/Format | Biome |

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase + Cloudflare R2 credentials

# Start development server
pnpm dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Application URL |
| `NEXT_PUBLIC_APP_NAME` | Application name |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 public URL base |
| `ADMIN_BOOTSTRAP_EMAIL` | Initial admin email |
| `ADMIN_BOOTSTRAP_SECRET` | Initial admin password |

## Scripts

| Command | Action |
|---------|--------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format |
| `pnpm exec tsc --noEmit` | Type-check only |

## Design Principles

- **Content first.** The lecturer's voice is the product.
- **Low-data respectful.** Lazy load audio, don't autoplay.
- **Built for Android mid-range.** Test on a ₦80k phone.
- **Arabic/Islamic aesthetic.** Warm neutrals, green accents.
- **No clutter.** No sidebar, notifications, or engagement metrics.

## Architecture

- **Route groups**: `(public)/` for user-facing pages, `(admin)/` for admin CMS
- **Admin guard**: `proxy.ts` (Next.js 16 — renamed from `middleware.ts`) checks Supabase SSR session
- **Admin roles**: `super_admin` (full access) or `scholar_admin` (scoped to one scholar)
- **Content hierarchy**: Scholar → Series → Episodes
- **Offline**: Serwist service worker caches audio + images; PWA installable on Android Chrome

## URL Structure

```
/                           → Home
/scholars                   → All scholars
/scholars/[slug]            → Scholar profile
/scholars/[slug]/[series]   → Series with episodes
/lectures/[slug]            → Individual lecture
/search?q=...               → Search
/downloads                  → Downloaded lectures
/admin                      → Admin panel
```

## Roadmap

- **v1 (MVP)**: Web app (PWA) — in progress
- **v2**: iOS/Android apps, bookmarks, playback history, scholar self-upload, dark mode, multi-language UI
- **v3**: Video content, live streaming
