# Manhaj — Agent Instructions

> Audio lecture platform for Nigerian Sunni/Salafi scholars.
> Tagline: *Ilm, organized.*

## Stack

- Next.js 16.2.9 (Turbopack, App Router), React 19.2.4, TypeScript 5+
- Tailwind CSS v4 (no `tailwind.config.ts` — CSS-based config in `app/globals.css`)
- Supabase (DB + Auth), Cloudflare R2 (audio), Vercel (deploy)
- Serwist (PWA), Zustand (player state), Biome (lint/format)

## Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format --write |
| `pnpm exec tsc --noEmit` | Type-check only |

## Critical Conventions

- **Read `node_modules/next/dist/docs/` before writing code** — Next.js 16 has breaking changes from your training data
- **Path alias**: `@/*` maps to project root (e.g. `@/lib/`, `@/components/`)
- **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`)
- **Biome** handles both lint and format — no ESLint/Prettier
- **Tailwind v4**: `@import "tailwindcss"` in CSS; theme tokens in `@theme` directives
- **Tests**: none configured yet
- **Single-package repo** despite `pnpm-workspace.yaml` (ignores `sharp` + `unrs-resolver` built deps only)
- **Existing components**: never recreate a component that already exists. Always check `components/ui/`, `components/layout/`, `components/`, and `lib/` before creating anything new. Prefer reusing over rewriting.

## Architecture

- **Route groups**: `(public)/` for user-facing pages, `(admin)/` for CMS
- **Admin guard**: `proxy.ts` (Next.js 16 — renamed from `middleware.ts`) checks Supabase SSR session on `/admin*` and `/api/admin/*` paths
- **Admin roles**: `super_admin` (full access) and `scholar_admin` (scoped to one scholar via `scholar_id`)
- **Auth flow**: Supabase SSR cookies → `getCurrentAdmin()` queries `admins` table → returns typed `CurrentAdmin` or null
- **R2 upload**: `lib/r2.ts` uploads audio via S3-compatible API; `requireEnv()` validates env vars at module load

## Data Model (Core)

```
scholars → series → episodes (hierarchy)
admins  → references auth.users(id), scoped by role + scholar_id
```

See `CODEBASE_STATE.md` §5 for full schema (tables, relationships, types).

## URL Structure

```
/                           → Home
/scholars                   → All scholars
/scholars/[slug]            → Scholar profile + series
/scholars/[slug]/[series]   → Series + episodes
/lectures/[slug]            → Individual lecture (shareable, SEO'd)
/search?q=...               → Search results
/downloads                  → Downloaded lectures (PWA local storage)
/admin                      → Protected admin panel
```

## Player Store (Zustand)

Single source of truth in `store/player.ts`. Tracks: `currentEpisode`, `isPlaying`, `currentTime`, `duration`, `speed`, `isLoading`, `sleepTimerRemaining`. Actions: `setEpisode` (resets time+play), `clear` (resets to defaults including speed).

## Key Types

```typescript
Language = "yoruba" | "english" | "arabic"
Speed = 0.75 | 1 | 1.25 | 1.5 | 2
AdminRole = "super_admin" | "scholar_admin"
Tag = "aqeedah" | "fiqh" | "tafseer" | "hadith" | "seerah" | "manhaj" | "adab" | "family" | "ibadah" | "dawah" | "ruqyah" | "arabic"
```

## Content Ingestion

1. Scholar's admin receives audio file (WhatsApp, email, recording)
2. Uploads to Cloudflare R2 via admin portal
3. Creates episode entry in Supabase (title, series, tags, duration) — scoped to their assigned scholar
4. Content goes live (admin must call upload API endpoint)

## CI/CD
- Never commit secrets or credentials
- Never commit sensitive data
- Never commit build artifacts
- Never commit .opencode/tasks or .opencode/docs/*.md except for documentation updates

## PWA

- Serwist for service worker with runtime caching for audio (mp3/wav/ogg) and images
- Audio cache: `CacheFirst`, max 100 entries, 30-day expiry with range request support
- Icons: `public/icons/icon-{192,512}x{192,512}.png` + maskable variant
- Manifest at `public/manifest.json`
