# Manhaj — Post-Fix Audit Report

> Generated 2026-07-05 after sub-agent audit + fixes.

---

## Issues Found & Fixed

### 🔴 High Severity (8/8 fixed)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 1 | `/admin/series/new` page missing — dashboard link → 404 | `admin/page.tsx:68` | Changed link to `/admin/series` (inline create dialog exists) |
| 2 | No pagination on admin list pages — FULL table scans | `admin/episodes/page.tsx`, `admin/series/page.tsx`, `admin/scholars/page.tsx` | Added `.limit(100)` to all queries |
| 3 | `getCurrentAdmin` called twice per dashboard load (layout + page) | `admin/layout.tsx:10`, `admin/page.tsx:22` | Wrapped with `React.cache()` for request-scoped dedup |
| 4 | Slug collision possible — `Date.now().toString(36)` not unique | All 3 POST route handlers | Switched to `crypto.randomUUID().slice(0, 8)` |
| 5 | Inconsistent error handling — 8 functions silently return `[]`, 4 throw | `lib/data.ts` | Standardized: all functions now throw on error |
| 6 | Scholar profile fetches ALL episodes/series with no limit | `scholars/[slug]/page.tsx:26-29` | Added `.limit(50)` to both queries |
| 7 | Missing `@theme` tokens — `text-display`, `text-title`, `text-label` used but undefined | `globals.css`, `admin/page.tsx` | Added tokens to `@theme {}` |
| 8 | `scrollbar-none` not a valid Tailwind v4 utility | `page.tsx:53` | Added `@utility scrollbar-none` |

### 🟡 Medium Severity (pre-existing, not touched)

| # | Issue | File(s) | Notes |
|---|-------|---------|-------|
| 9 | EpisodeCard play button inside `<Link>` — event collision | `page.tsx:54-62` | Click triggers both nav + play |
| 10 | Back button label renders as `aria-label` only, no visible text | `header.tsx:42-53` | DESIGN.md wants visible label |
| 11 | Scholar slug in tab — nullable `scholar` field | `scholar-tabs.tsx:30` | Could produce `/scholars/undefined/...` |
| 12 | Bottom padding inconsistent — `pb-14` vs `pb-28` across pages | Multiple public pages | MiniPlayer gap varies |
| 13 | Client-side filtering of full dataset in admin lists | `series-list.tsx`, `episodes-list.tsx` | All data fetched server → filtered client |
| 14 | `getSeriesWithEpisodes` makes 3 sequential queries, 1 redundant | `lib/data.ts:162-212` | Scholar lookup could use join |
| 15 | Inconsistent role guard — `throw Error` vs `redirect` | `admin/admins/page.tsx`, `admin/scholars/page.tsx` | Should standardize to redirect |

### 🟢 Low Severity (pre-existing)

| # | Issue | File(s) |
|---|-------|---------|
| 16 | `Language` type missing `"hausa"` but DB schema includes it | `types/index.ts:1` vs `001_initial_schema.sql:45` |
| 17 | `getEpisodeBySlug` uses `.maybeSingle()` vs `.single()` elsewhere | `lib/data.ts:223` |
| 18 | `getAudioDuration` is an always-null stub | `lib/audio.ts:25-29` |
| 19 | Admin login no CSRF/rate-limit on client | `login-form.tsx:25-28` |
| 20 | Admin `<img>` tags without dimensions (CLS risk) | `series-list.tsx`, `scholars-list.tsx` |
| 21 | Subtle hover contrast — `hover:bg-sand-100` on white | Admin list rows |

---

## Auth Guard Audit

| Check | Status |
|-------|--------|
| Proxy guards `/admin*` and `/api/admin/*` | ✅ |
| Proxy bypass for `/admin/login` | ✅ |
| API routes call `requireAdminApi()` | ✅ |
| Role-scoping for scholar_admin mutations | ✅ |
| Super_admin gating on scholar/admin routes | ✅ |
| Scholar admin pages filter by `scholar_id` | ✅ |
| Self-deactivation prevention | ✅ |

**Zero auth bypass vulnerabilities.** Defense-in-depth: proxy.ts (edge) → `requireAdmin()` (layout) → `requireAdminApi()` (routes).

---

## Logo Updates

| Component | Before | After |
|-----------|--------|-------|
| `Header.tsx` | Text "Manhaj" | `<Image src="/logo.png">` + "Manhaj" |
| `AdminSidebar` | Text "Manhaj Admin" | `<Image src="/logo.png">` + "Admin" |
| Admin login | WaveformSeal only | 48px logo + "Admin" heading |
| Root `layout.tsx` | No icons | `icons: { icon, apple }` pointing to logo |

---

## Verification

| Check | Result |
|-------|--------|
| `pnpm exec tsc --noEmit` | ✅ Pass — 0 errors |
| `pnpm lint` | ✅ 0 new errors (all pre-existing a11y/img warnings) |
| `pnpm format` | ✅ Applied |
