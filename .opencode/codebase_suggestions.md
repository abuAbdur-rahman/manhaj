# Codebase Suggestions (Deferred)

> Generated: 2026-06-27
> Medium/low-priority improvements and polish items from full codebase review.
> 27 items — safe to defer post-MVP or assign to cleanup sprints.

---

## Config & Build

| # | File | Issue | Suggested Fix |
|---|------|-------|---------------|
| S01 | `package.json` | `babel-plugin-react-compiler` unused — Next.js 16 uses its own Rust-based compiler | Remove dependency |
| S02 | `package.json` | `howler` + `@types/howler` unused — using native `<audio>` instead | Remove both deps |
| S03 | `tsconfig.json` | Target `ES2017` outdated | Change to `ES2022` |
| S04 | `biome.json` | No `noConsoleLog` restriction | Add to linter rules |
| S05 | `package.json` | Missing `typecheck` script | Add `"typecheck": "tsc --noEmit"` |
| S06 | `next.config.ts` | R2 hostname `*.r2.dev` won't match custom CDN domain | Add expected custom domain pattern |

## App Config / Metadata

| # | File | Issue | Suggested Fix |
|---|------|-------|---------------|
| S07 | `app/layout.tsx` | Missing iOS PWA meta tags | Add `apple-mobile-web-app-capable` |
| S08 | `app/layout.tsx` | Missing OpenGraph `url` and `siteName` | Add for better link previews |
| S09 | `app/layout.tsx` | Noto Naskh Arabic loads 4 unused weights | Restrict to weight 400 only |

## Player / Store

| # | File | Issue | Suggested Fix |
|---|------|-------|---------------|
| S10 | `store/player.ts:31-37` | `setEpisode` doesn't reset `isLoading` | Add `isLoading: true` to setter |
| S11 | `types/index.ts:87-95` | `PlayerState` has `sleepTimer` but store uses `sleepTimerRemaining` — dead type | Remove or align |
| S12 | `lecture-content.tsx:173-178` | Sleep timer tick lives in page `useEffect` — pauses on navigation | Document or move to layout |

## UI Polish

| # | File | Issue | Suggested Fix |
|---|------|-------|---------------|
| S13 | `search-input.tsx:21-31` | Debounce timer not cleaned up on unmount | Add `useEffect` cleanup |
| S14 | `chip.tsx:31-36` | Remove button `aria-label="Remove"` — no context | Include chip text in label |
| S15 | `select.tsx:73-88` | Missing checkmark on selected item | Add `SelectPrimitive.ItemIndicator` |
| S16 | `dropdown-menu.tsx:106-115` | SubContent not in Portal — clips on overflow | Wrap in `<Portal>` |
| S17 | All Radix wrappers | Missing `displayName` — anonymous in DevTools | Add `displayName` |
| S18 | `badge.tsx:26` | Extends `HTMLAttributes` — allows event handlers on decorative element | Narrow the props interface |
| S19 | `empty-state.tsx:28` | Inconsistent spacing (`mt-4` + `mt-1`) | Use `flex flex-col gap-1` |
| S20 | `globals.css:21` | `--font-arabic` token uses raw font name (works at runtime but misleading) | Align with next/font variable pattern |
| S21 | `components/layout/admin-sidebar.tsx:134` | Sign-out button outside `<nav>` landmark | Move into `<nav>` or wrap in own `<nav>` |
| S22 | `components/layout/header.tsx:15` | `HeaderProps` accepts any `children` — no structure enforcement | Use compound component or factory |

## Data Layer

| # | File | Issue | Suggested Fix |
|---|------|-------|---------------|
| S23 | `lib/data.ts` | Repeated `episode_count` extraction 7+ times | Extract helper function |
| S24 | `lib/data.ts` | Inconsistent error handling — some return `[]`, some throw | Standardize to one pattern |
| S25 | `lib/search.ts:40` | No full-text ranking — `pg_trgm` mentioned in BRD but unused | Use `similarity()` or `ts_rank()` |
| S26 | `lib/search.ts:40` | No pagination (hard limit 50) | Add page/pageSize params |
| S27 | `lib/audio.ts:25-30` | `getAudioDuration` is a permanent TODO stub | Implement or remove |
| S28 | `lib/download.ts` | No download progress reporting | Use `response.body.getReader()` |
| S29 | `lib/utils.ts:19-25` | `formatDistanceToNow` produces "-1 year ago" for future dates | Add negative diff guard |

## Public Pages

| # | File | Issue | Suggested Fix |
|---|------|-------|---------------|
| S30 | `app/(public)/page.tsx` | Empty text contrast `text-sand-300` — ~1.5:1 | Use `text-sand-500` or darker |
| S31 | `scholars/[slug]/page.tsx` | `ScholarBio` defined after usage — hoisting-dependent | Extract to separate file |
| S32 | `lectures/[slug]/lecture-content.tsx:21` | Inline `import("@/types")` type annotation | Use top-level import |
| S33 | `app/(public)/scholars/[slug]/[series]/series-content.tsx:57-60` | "Play All" only plays first episode | Rename button or add queue |
| S34 | `lecture-content.tsx:137-171` | Audio loads on mount even when not playing — wastes bandwidth | Set `preload="none"` |
| S35 | `lecture-content.tsx:127-135` | WhatsApp share URL isn't shortened | Add `ref=whatsapp` at minimum |

## Admin Pages

| # | File | Issue | Suggested Fix |
|---|------|-------|---------------|
| S36 | `login-form.tsx` | No client-side Zod validation | Add Zod schema |
| S37 | `admin/loading.tsx` | Stat skeletons shown for scholar_admin who won't see stats | Make role-agnostic |
| S38 | `admin/error.tsx` | Error message doesn't distinguish auth vs data errors | Check for session expiry |
| S39 | All list admin pages | Search not debounced (300ms as spec'd) | Add `useDebounce` |

## API Routes

| # | File | Issue | Suggested Fix |
|---|------|-------|---------------|
| S40 | `upload/route.ts:5` | 500 MB limit risks OOM on Vercel serverless | Lower to 200 MB |
| S41 | All routes | No rate limiting anywhere | Add in-memory rate limiting |
| S42 | `lib/r2.ts:28` | Ineffective `accept-ranges` metadata | Remove (bucket-level config) |
