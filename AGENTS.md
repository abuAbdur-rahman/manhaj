# Manhaj — Agent Instructions

> Audio lecture platform for Nigerian Sunni/Salafi scholars. `.opencode/docs/manhaj-brd-v1.1.md` and `.opencode/docs/manhaj-setup-v1.2.md` are the authoritative specs.

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

## Architecture (from `.opencode/docs/manhaj-setup-v1.2.md`)

- Route groups: `(public)/` for user-facing pages, `(admin)/` for CMS
- Admin guarded by `proxy.ts` (Supabase SSR session check on `/admin*` and `/api/admin/*`)
- Expected dirs not yet created: `components/`, `lib/`, `hooks/`, `store/`, `types/`, `supabase/`
- Types, schemas, and Supabase RLS policies defined in setup doc — follow them
- Admin roles: `super_admin` (full access) and `scholar_admin` (scoped to one scholar)