# Codebase Issues

> Generated: 2026-06-27
> Scope: Full codebase review across 10 subagent reviews + web research validation
> Total findings: **17 CRITICAL · 48 IMPORTANT · 27 SUGGESTION**
> Web research by @check agent — see corrections below

---

## 🔬 Research Corrections (from Web Validation)

| # | Finding | Original Verdict | Corrected Verdict |
|---|---------|-----------------|-------------------|
| C1 | `proxy.ts` named export | ❌ CRITICAL — won't execute | ✅ **FALSE ALARM** — Next.js 16 renamed `middleware.ts` → `proxy.ts`. Named `export function proxy()` is valid alongside `export default`. File name is correct. |
| C5 | `encodeURIComponent` on R2 key | ❌ ALWAYS breaks | ⚠️ **Nuance** — S3 API (`PutObjectCommand`) handles keys with literal `/` correctly. Public URLs with `%2F` in path **may** 404. Use presigned URLs or unencoded key for public access. |
| C17 | `opacity-6` invalid in Tailwind v4 | ✅ Confirmed | ✅ Confirmed — valid steps: 0, 5, 10, 15... Use `opacity-5`, `opacity-10`, or `opacity-[0.06]` |
| C16 | `tailwindcss-animate` v4 incompatible | ✅ Confirmed | ✅ Confirmed — replace with `tw-animate-css` via `@import "tw-animate-css"` |
| C9/C24-26 | `"use client"` required for Radix wrappers | ✅ Confirmed | ✅ Confirmed — Radix packages now include their own directives but wrapper files still need it |
| I45 | Slider required keyboard handlers | Arrow keys only | ⚠️ **Stricter** — Arrow keys + **Home + End** are ALL minimum required per ARIA APG |
| I12 | Serwist audio caching | CacheFirst is fine | ⚠️ **Must add** `RangeRequestsPlugin` for audio seeking in cached files |

**Sources:** Next.js 16 proxy docs, Cloudflare R2 community, Tailwind CSS v4 opacity spec, tw-animate-css, WAI-ARIA APG slider pattern, Serwist docs, Supabase SSR docs.

---

## 🔴 CRITICAL

#### C2. `admins/route.ts:135` — Temp password returned in API response body
Plaintext password visible in HTTP logs, Vercel edge logs, browser devtools.
**Fix:** Remove from response; send via secure out-of-band channel post-MVP.

#### C3. `upload/route.ts:13` — `as File` cast crashes on string FormData entry
`formData.get("audio")` returns `File | string`. String input → `file.type.startsWith(...)` throws.
**Fix:** Add `instanceof File` guard.

#### C4. `lib/r2.ts` + `lib/supabase/admin.ts` — No `import 'server-only'` guard
Service role key, S3 credentials, and env vars could leak to client bundle.
**Fix:** Add `import 'server-only'` to `lib/r2.ts`, `lib/supabase/admin.ts`, `lib/supabase/server.ts`.

---

### Broken Features (Data Loss / Non-Functional)

#### C5. `lib/r2.ts:31` — `encodeURIComponent(key)` may 404 on R2 public URLs
S3 API handles keys with `/` correctly, but public R2 URLs with `%2F` in path may return 404. R2 community reports inconsistent behavior.
**Fix:** Use presigned URLs from SDK for public access, or construct URL with unencoded path segments. Prefer presigned URLs served via API so the URL construction is handled entirely server-side.

#### C6. `lib/download.ts:5-10` + `lib/downloads-db.ts` — Audio blob never persisted
`response.blob()` is read for `blob.size` but the binary data is discarded. Offline download is non-functional beyond Serwist's fragile CacheFirst.
**Fix:** Store `Blob` in IndexedDB alongside metadata, or explicitly write to Cache API.

#### C7. `lib/search.ts:22-26` — Search across scholar/series names is completely broken
- `scholar_id.name.ilike` and `series_id.title.ilike` are invalid PostgREST column paths (UUID columns have no nested properties).
- `tags.cs.{${lower}}` with multi-word queries wraps everything as a single-element array — never matches.
**Fix:** Pre-query scholar/series IDs matching search term, then filter episodes. Or use Postgres full-text across joined tables.

#### C8. `lib/search.ts:1` — Uses browser Supabase client in data-access layer
`searchEpisodes` imports `createClient` from `@/lib/supabase/client`. Breaks SSR for `/search` page — throws during server render.
**Fix:** Import `@/lib/supabase/server` instead.

#### C9. `components/episodes/download-row.tsx` — Missing `"use client"` directive
All event handlers (`onClick` on remove button, `onRemove` callback) are silently stripped in Server Components. Delete button is non-functional.
**Fix:** Add `"use client";` at top of file.

#### C10. `app/(public)/lectures/[slug]/lecture-content.tsx:193-198` — `<audio>` lives in page component, destroyed on navigation
Navigating away unmounts the `<audio>` element. MiniPlayer still shows "playing" state from Zustand store but no audio element to control. Playback permanently stuck.
**Fix:** Move `<audio>` element to persistent layout component (co-located with MiniPlayer).

---

### Data Integrity & Validation

#### C11. `admins-list.tsx:275` — "(you)" badge uses wrong comparison
`admin.id === initialAdmins[0]?.id` compares against first array element. Badge appears on wrong person if logged-in admin isn't first in list.
**Fix:** Pass `currentAdminId` from server component and compare directly.

#### C12. `new-episode-form.tsx:490,505` — Spinner shown on wrong button
`isSubmitting && !audioUrl` / `isSubmitting && audioUrl` incorrectly gate spinner visibility. Clicking "Save draft" after upload shows spinner on "Publish" button instead.
**Fix:** Both buttons should check `isSubmitting` only; distinguish via button text ("Saving..." / "Publishing...").

#### C13. `scholars-list.tsx:272-276` — Stale closure over `photoUploading`
`handleFormSubmit` captures initial `false` value of `photoUploading` — form can submit while photo is still uploading, discarding the upload.
**Fix:** Add `photoUploading` to dependency array.

### Layout / HTML Spec Violations

#### C15. ALL admin child pages — Nested `<main>` elements
`AdminDashboardShell` renders `<main>`. Each child page renders another `<main>`. HTML spec violation — screen reader landmarks break.
**Affected:** `admin/page.tsx:109`, `episodes-list.tsx:179`, `series-list.tsx`, `scholars-list.tsx`, `admins-list.tsx`
**Fix:** Change inner `<main>` to `<div>` or `<section>`.

#### C16. `components/ui/dialog.tsx:33,51` — Animation classes from `tailwindcss-animate` — package not installed, incompatible with Tailwind v4
Classes `animate-in`, `animate-out`, `fade-out-0`, `zoom-out-95` silently produce zero animation. Dialogs pop in/out instantly.
**Fix:** Define equivalent `@keyframes` in `globals.css` and use `@theme` tokenized animation classes.

#### C17. `opacity-6` used in 2 locations — invalid Tailwind v4 class
Tailwind v4 opacity scale: 0, 5, 10, 15... No `6`. Class silently ignored.
**Affected:** `waveform-seal.tsx:26` (watermark renders at 100% opacity), and possibly elsewhere.
**Fix:** Use `opacity-5` or `opacity-[0.06]`.

#### C18. `app/(public)/` — No `error.tsx` or `loading.tsx` in public route group
Entire public site has zero error resilience. DB failure → Next.js default error screen. On 3G, blank screen for seconds.
**Fix:** Add `app/(public)/error.tsx` (branded + retry) and `app/(public)/loading.tsx` (waveform skeleton).

---

## 🟡 IMPORTANT

### Auth & Access Control

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| I01 | `admins/page.tsx` | 10 | `throw new Error("Not found")` for non-super_admin — misleading logs. Use `redirect("/admin")` like `scholars/page.tsx` | Unify pattern |
| I02 | `proxy.ts` | 37-44 | Middleware allows ANY authenticated Supabase user to reach admin shell; real check happens only in layout. Exposes admin app to non-admin users. | Check `admins` table in middleware |
| I03 | `lib/auth.ts` | - | `requireAdminApi(role)` accepts optional role but no caller uses it. Manual checks everywhere — risk of omission. | Refactor to use built-in role param |
| I04 | `admins/route.ts` | 52-62 | No FK validation on `scholar_id` — cryptic 500 on non-existent scholar | Verify scholar exists before insert |

### Layout / Navigation

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| I05 | `app/(public)/layout.tsx` | 15 | `pb-14` (56px) insufficient when MiniPlayer is visible — additional 56px hides content | Dynamic `pb-14` / `pb-28` based on player state |
| I06 | `app/(public)/lectures/[slug]/page.tsx`, `downloads/page.tsx` | - | Same `pb-14` issue — CTAs hidden behind MiniPlayer | Change to `pb-28` |
| I07 | `bottom-nav.tsx` | 48-62 | No `aria-current="page"` on active link | Add `aria-current={isActive ? "page" : undefined}` |
| I08 | `admin-sidebar.tsx` | 115-129 | Same — no `aria-current` | Same fix |
| I09 | `bottom-nav.tsx` | 55 | Inactive nav contrast ~3.46:1 — below WCAG AA 4.5:1 for 13px text | Use `text-forest-700/80` or darker |
| I10 | `admin-mobile-nav.tsx` | 75 | Inactive text contrast ~1.35:1 — nearly invisible | Use `text-forest-700/60` at minimum |
| I11 | `header.tsx` | 47 | `router.back()` has no fallback on direct navigation — does nothing | Add `window.history.length > 1` check + `/` default |
| I12 | `mini-player.tsx` | 24-43 | MiniPlayer body not tappable per DESIGN.md §4.5 ("tap body to expand") | Wrap in `<Link>` to `/lectures/[slug]` |

### Data / API / Backend

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| I13 | `login-form.tsx` | 24-40 | Missing `catch` block — network errors silently swallowed, user gets dead UI | Add catch with meaningful error message |
| I14 | `login-form.tsx` | 31-33 | All Supabase auth errors masked as "Invalid email or password" — hides rate-limiting, disabled accounts | Map specific error codes |
| I15 | `admin/page.tsx` | 21-22 | Redundant `getCurrentAdmin()` call — layout already called it | Use `cache()` to deduplicate across layout+page |
| I16 | `admin/page.tsx` | 36-38 | 3 sequential DB queries for scholar_admin (requireAdmin → getCurrentAdmin → getScholarById) | Join admin+scholar query |
| I17 | `episodes/route.ts` | 72-76 | Series lookup missing `is_active` filter — episodes can be created under soft-deleted series | Add `.eq("is_active", true)` |
| I18 | `episodes/[id]/route.ts` | 166-169 | Episode hard-delete while everything else uses soft-delete — dead links for users | Soft-delete with `is_active` or `is_published = false` |
| I19 | `upload/route.ts` | 5 | 500 MB limit risks OOM on Vercel serverless (512MB limit) | Lower to 200 MB |
| I20 | 3 slug-gen sites | - | `Date.now()` collision risk on concurrent requests | Use `crypto.randomUUID()` |
| I21 | 4 PATCH handlers | - | Empty body (`{}`) silently returns 200 — no indication nothing changed | Guard with `Object.keys.length === 0` → 400 |
| I22 | `admlogin/route.ts` | 123 | Rollback `deleteUser` failure silently swallowed when admin insert fails — orphaned auth user | Log and surface error |
| I23 | `series/route.ts` | 63-73 | Confusing "scholar_id is required" for super_admin — no context of available scholars | List available scholars in error |

### UI Components

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| I24 | `components/ui/chip.tsx` | 1 | Missing `"use client"` — event handlers stripped in Server Components | Add `"use client"` |
| I25 | `components/ui/input.tsx` | 1 | Same — event handlers stripped | Add `"use client"` |
| I26 | `components/ui/button.tsx` | 1 | Same — event handlers stripped | Add `"use client"` |
| I27 | `episode-card.tsx` | 65,75 | Touch targets 40x40px — below 44x44px DESIGN.md minimum | Change to `h-11 w-11` min |
| I28 | `player-controls.tsx` | 92 | Speed buttons 32x40px — below 44px | `min-h-11 min-w-11` |
| I29 | `scrubber.tsx` | 83-88 | `role="slider"` with no keyboard handlers (ArrowLeft/Right/Home/End) — keyboard users can't operate | Add `onKeyDown` |
| I30 | `episode-row.tsx` | 32-60 | Play button missing `aria-label` — screen readers announce "button" with no context | `aria-label="Play: {episode.title}"` |
| I31 | `player-controls.tsx` | 85-98 | Speed active state communicated via color only — no `aria-pressed` | Add `aria-pressed` |
| I32 | `episode-card.tsx`, `download-row.tsx` | - | Geist Mono class `font-mono` doesn't resolve — `--font-mono` never defined in `globals.css` | Add `--font-mono: var(--font-geist-mono)` to `@theme` |

### Forms & Validation

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| I33 | `new-episode-form.tsx` | 142-149 | `AudioContext` leak on rapid file selection — browser limit ~6 contexts | Reuse `audioContextRef` |
| I34 | `new-episode-form.tsx` | 175-186 | Audio field not marked as "required to publish" — users fill everything then get validation error | Add visual hint + disable Publish button |
| I35 | `new-episode-form.tsx` | 90-162 | No max file size check on client — 500MB file causes OOM | Add 200MB limit |
| I36 | `new-episode-form.tsx` | 164-173 | Cancel during upload doesn't abort XHR — background upload continues | `xhr.abort()` in `clearFile` |
| I37 | `episodes-list.tsx` | 270 | `formatDuration(episode.duration_seconds ?? 0)` shows "0:00" for null durations | Show "--:--" placeholder |
| I38 | `scholars-list.tsx` | 226-231 | Social link values not trimmed — whitespace-only values sent as URLs | `.trim()` before sending |
| I39 | `series-list.tsx` | 72-74 | `useEffect` sync overwrites optimistic local state on `router.refresh()` | Remove useEffect; use `key` prop for reset |
| I40 | `admins-list.tsx` | 477-490 | Scholar ID is free-text UUID input — super_admin must type raw UUID | Replace with `<Select>` from scholars list |
| I41 | `series-list.tsx` | 193-194 | Created response may not match full `SeriesRow` type — `episode_count` undefined | Merge with defaults |
| I42 | `episodes-list.tsx` | 103-154 | Optimistic updates have no rollback on API failure | Save prev state and revert on catch |
| I43 | `episodes-list.tsx` | 144 | Delete uses hard-remove while others use soft-delete — inconsistent | Align to soft-delete pattern |
| I44 | `series-list.tsx` | - | No cover image upload UI despite design spec requiring series covers | Add photo upload (like scholar form) |
| I45 | `admins-list.tsx` | 40-46 | `formatDate` returns "Invalid Date" for malformed strings | Add `isNaN(d.getTime())` guard |

### Performance & Architecture

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| I46 | `admin-dashboard-shell.tsx` | 29 | `createClient()` called on every render but only used in sign-out callback | Move into callback |
| I47 | `admin/loading.tsx` | 3-28 | No Header skeleton — layout shift on load | Add skeleton for Header + scope indicator |
| I48 | `admin/page.tsx` | 88-103 | Custom `text-*` typography classes undefined in Tailwind v4 — no styling | Define in `globals.css` via `@utility` |

---

## 🔵 SUGGESTION (Deferred / Polish)

### Config & Build

| # | File | Issue |
|---|------|-------|
| S01 | `package.json` | `babel-plugin-react-compiler` unused — Next.js 16 uses its own Rust-based compiler |
| S02 | `package.json` | `howler` + `@types/howler` unused — using native `<audio>` instead |
| S03 | `tsconfig.json` | Target `ES2017` outdated — change to `ES2022` |
| S04 | `biome.json` | No `noConsoleLog` restriction — add to linter rules |
| S05 | `package.json` | Missing `typecheck` script — add `"typecheck": "tsc --noEmit"` |

### App Config / Metadata

| # | File | Issue |
|---|------|-------|
| S06 | `app/layout.tsx` | Missing iOS PWA meta (`apple-mobile-web-app-capable`) |
| S07 | `app/layout.tsx` | Missing OpenGraph `url` and `siteName` |
| S08 | `app/layout.tsx` | Noto Naskh Arabic loads 4 weights (400-700) but only weight 400 is needed |
| S09 | `next.config.ts` | R2 hostname pattern `*.r2.dev` won't match custom CDN domain |

### Player / Store

| # | File | Issue |
|---|------|-------|
| S10 | `store/player.ts` | `setEpisode` doesn't reset `isLoading` — brief visual race on episode switch |
| S11 | `store/player.ts` | `PlayerState` type has `sleepTimer` but store uses `sleepTimerRemaining` — dead type |
| S12 | `lecture-content.tsx` | Sleep timer tick lives in page `useEffect` — pauses on navigation away. Document or move to layout. |

### UI Polish

| # | File | Issue |
|---|------|-------|
| S13 | `search-input.tsx` | Debounce timer not cleaned up on unmount |
| S14 | `chip.tsx` | Remove button `aria-label="Remove"` doesn't describe what's being removed |
| S15 | `select.tsx` | Missing `SelectPrimitive.ItemIndicator` — no visual checkmark on selected item |
| S16 | `dropdown-menu.tsx` | `DropdownMenuSubContent` not wrapped in `<Portal>` — can clip on overflow |
| S17 | All Radix wrappers | Missing `displayName` — anonymous in React DevTools |
| S18 | `badge.tsx` | Extends `HTMLAttributes` — allows event handlers on decorative element |
| S19 | `empty-state.tsx` | Inconsistent spacing — `mt-4` + `mt-1` instead of `gap` |
| S20 | `globals.css` | `--font-arabic` token uses raw font name, not next/font CSS variable (works at runtime but misleading) |

### Data Layer

| # | File | Issue |
|---|------|-------|
| S21 | `lib/data.ts` | Repeated `episode_count` extraction logic duplicated 7+ times — extract helper |
| S22 | `lib/data.ts` | Inconsistent error handling — some functions return `[]`, others throw |
| S23 | `lib/search.ts` | No full-text search ranking — `pg_trgm` mentioned in BRD but unused |
| S24 | `lib/search.ts` | No pagination on search results (hard limit 50) |
| S25 | `lib/audio.ts` | `getAudioDuration` is a permanent TODO stub |
| S26 | `lib/download.ts` | No download progress reporting |
| S27 | `lib/utils.ts` | `formatDistanceToNow` produces wrong output for future dates |

### Public Pages

| # | File | Issue |
|---|------|-------|
| S28 | `app/(public)/page.tsx` | Empty state text contrast `text-sand-300` on `sand-50` — ~1.5:1, far below WCAG AA |
| S29 | `app/(public)/scholars/[slug]/page.tsx` | `ScholarBio` defined after usage — hoisting-dependent order |
| S30 | `app/(public)/lectures/[slug]/lecture-content.tsx` | Inline `import("@/types")` type annotation instead of top-level import |

### Admin Pages

| # | File | Issue |
|---|------|-------|
| S31 | `login-form.tsx` | No client-side Zod validation — relies solely on HTML5 |
| S32 | `admin/loading.tsx` | Stat card skeletons shown for scholar_admin who won't see stats |
| S33 | `admin/error.tsx` | Error message generic — doesn't distinguish auth vs data errors |
| S34 | All list pages | Search debounce not implemented — filters on every keystroke |

---

## Stats by Category

| Category | CRITICAL | IMPORTANT | SUGGESTION |
|----------|----------|-----------|------------|
| Security/Auth | 4 | 4 | 0 |
| Broken Features | 6 | 0 | 0 |
| Data Integrity | 4 | 5 | 2 |
| API/Backend | 0 | 6 | 2 |
| Components | 2 | 6 | 2 |
| Layout/Nav | 0 | 8 | 0 |
| Forms/UX | 0 | 11 | 2 |
| UI Primitives | 2 | 2 | 5 |
| Config/Build | 0 | 0 | 5 |
| Performance | 0 | 3 | 3 |
| Player/Store | 0 | 0 | 3 |
| Styling | 0 | 2 | 2 |
| **Total** | **18** | **48** | **27** |

---

## Top 10 Must-Fix (do not ship without)

| Priority | Issue | Impact |
|----------|-------|--------|
| 1 | Audio blob never persisted in `download.ts`/`downloads-db.ts` → offline download is non-functional | Data loss |
| 2 | `lib/search.ts` — scholar/series name search completely broken | Core feature broken |
| 3 | `<audio>` element in `lecture-content.tsx` — destroyed on navigation → MiniPlayer stuck | Broken UX |
| 4 | `lib/r2.ts:31` — `encodeURIComponent(key)` may 404 on R2 public URL (use presigned or unencoded) | File inaccessibility |
| 5 | No `error.tsx` / `loading.tsx` in `(public)` route group → blank screen on 3G | No resilience |
| 6 | Missing `"use client"` on `download-row.tsx`, `chip.tsx`, `input.tsx`, `button.tsx` → silent dead UI | Silent failure |
| 7 | `dialog.tsx` animation classes from incompatible `tailwindcss-animate` v3 plugin — replace with `tw-animate-css` | No animation |
| 8 | Nested `<main>` in all admin pages → HTML spec violation, broken landmarks | Accessibility |
| 9 | `login-form.tsx` missing `catch` block → network errors swallowed with no feedback | Dead UI |
| 10 | Serious data issues: deleted episodes = hard delete, empty PATCH bodies return 200, slug collision risk | Data integrity |

---

## How to Fix

Each issue above has a suggested fix inline. Recommended approach:

1. **Fix download persistence** — store audio Blob in IndexedDB (critical for offline selling point)
2. **Fix R2 upload** — remove `encodeURIComponent`, use presigned URLs or unencoded keys
3. **Add `error.tsx` + `loading.tsx`** to public route group (two new files)
4. **Add `"use client"`** to 4 UI components (four one-line changes)
5. **Fix search** — rewrite `searchEpisodes` to work across joined tables
6. **Fix download** — persist `Blob` in IndexedDB
7. **Fix dialog animations** — add `@keyframes` in `globals.css`
8. **Fix `<main>` nesting** — change all admin child pages inner `<main>` to `<div>`
9. **Fix `<main>` nesting** — change all admin child pages inner `<main>` to `<div>`
10. (removed - #10 shifted up: was Hausa language, intentional exclusion)
