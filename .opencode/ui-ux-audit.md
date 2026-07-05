# Manhaj — Mobile-First UI/UX Audit

> Generated 2026-07-05. Read-only audit: public pages, admin pages, shared shell/components, mobile performance & a11y.
> Priority: before medium-priority tasks in `.opencode/tasks/page-tasks.md`.

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 14 |
| 🟡 High | 29 |
| 🔵 Medium | 13 |
| 🔹 Low | 5 |
| **Total** | **61** |

---

## 🔴 Critical

### Audio / Offline (3)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| C1 | Downloaded audio stored but never usable for offline playback — player always streams `audio_url` | `lib/downloads-db.ts:21`, `audio-provider.tsx:34`, `download-row.tsx:23` | Offline download ≠ offline playback. MVP #1 differentiator broken. | Extend episode model with local blob URL resolution. Make download-row body a play action using local source. |
| C2 | Client decodes entire uploaded MP3 in JS memory via `decodeAudioData()` | `new-episode-form.tsx:139` | Crashes/freezes low-end Android on large lectures | Skip client decode; use server-side duration or `<audio preload="metadata">` |
| C3 | "Cancel" upload does not abort active XHR — upload continues silently | `new-episode-form.tsx:412` | Wastes mobile data; may set uploaded state later | Store `XMLHttpRequest`/`AbortController` in ref, abort on cancel |

### Layout & Navigation (6)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| C4 | `<Link>` wraps `EpisodeCard` which contains interactive buttons — invalid nesting | `page.tsx:55`, `episode-card.tsx:62`, `lecture-content.tsx:267` | Broken touch behavior, screen reader confusion, keyboard traps | Make card pure link or remove inner buttons; split into link display + separate controls |
| C5 | No safe-area-inset-bottom on BottomNav, MiniPlayer, or AdminMobileNav | `bottom-nav.tsx:37`, `admin-mobile-nav.tsx:55`, `public/layout.tsx:17` | Nav/player hidden under Android/iOS gesture bar | Add `pb-[env(safe-area-inset-bottom)]` to nav + player containers, use `h-[calc(3.5rem+env(safe-area-inset-bottom))]` |
| C6 | No safe-area-inset-top on sticky Header | `header.tsx:111` | Header content under notch/status bar on PWA | Add `pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))]` |
| C7 | `pb-14` across pages doesn't account for MiniPlayer presence — content hidden | `public/layout.tsx:16`, multiple public pages | Bottom content permanently clipped when player active | Layout-level dynamic spacer driven by `currentEpisode` or CSS var |
| C8 | Admin mobile content has no bottom padding — last items hidden behind nav | `admin-dashboard-shell.tsx:52` | Form fields, buttons, list items unreachable | Add `pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0` |
| C9 | Admin mobile nav links lack `aria-current` | `admin-mobile-nav.tsx:68` | Screen readers can't identify active page | Add `aria-current={isActive ? "page" : undefined}` |

### Admin Mobile Overflows (3)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| C10 | Admin episode row — 7+ items in single flex line on 360px | `episodes-list.tsx:247` | Horizontal overflow, actions hidden/unreachable | Responsive mobile card layout: stack metadata/actions below title |
| C11 | Admin admin row — email, scholar, role, status, date, action in one flex | `admins-list.tsx:269` | Horizontal overflow on small Android | Mobile card with metadata rows + action area |
| C12 | Admin series row — image, title, featured badge, status, edit, delete cramped | `series-list.tsx:313` | Actions overlap, tap misses | Stack badges/actions under title at base breakpoint |

---

## 🟡 High

### Touch Targets Below 44px (9)

| # | Issue | Location | Current | Fix |
|---|-------|----------|---------|-----|
| H1 | Scrubber seek track is `h-2` with `h-4` thumb | `scrubber.tsx:78` | ~8px touch target | Wrap in 44px interactive area; keep visual rail slim |
| H2 | Playback speed buttons are `h-8 w-10` | `player-controls.tsx:86` | 32×40px | `min-h-11 min-w-11` or 44px segmented cells |
| H3 | Search filter chips too small | `chip.tsx:24` | ~32px tall | `min-h-11 min-w-11` preserving pill style |
| H4 | EpisodeCard action buttons `h-10 w-10` | `episode-card.tsx:65` | 40px | `h-11 w-11` |
| H5 | Search clear button `p-0.5` | `search-input.tsx:57` | ~20px hit area | `h-11 w-11` container |
| H6 | Tabs trigger `h-8` | `tabs.tsx:18` | 32px | `min-h-11` |
| H7 | Select items `h-10` | `select.tsx:81` | 40px | `min-h-11` |
| H8 | Dropdown items `h-10` | `dropdown-menu.tsx:46` | 40px | `min-h-11` |
| H9 | Chip remove button `p-0.5` | `chip.tsx:40` | ~16px | Merge into full chip target or `h-11 w-11` |
| H10 | Admin sidebar nav rows ~36px | `admin-sidebar.tsx:127` | 36px | `min-h-11` |
| H11 | Admin sidebar sign-out ~36px | `admin-sidebar.tsx:148` | 36px | `min-h-11` |
| H12 | Admin mobile sheet links/buttons ~40px | `admin-dashboard-shell.tsx:70,91` | 40px | `min-h-11 focus-visible:outline-2` |
| H13 | Sheet close button lacks 44px | `sheet.tsx:78` | ~32×32 | `h-11 w-11` |
| H14 | Logo link lacks 44px target | `header.tsx:37` | ~28×28 | `min-h-11 rounded-lg` |
| H15 | Breadcrumb links lack 44px target | `header.tsx:75` | text-only | `min-h-11 inline-flex items-center` |

### Contrast / Color Token Abuse (10)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| H16 | Header subtitle `text-sand-300` on light bg — fails 4.5:1 | `header.tsx:95` | `text-forest-700/70` |
| H17 | Mini-player timestamp `text-sand-300` — fail | `mini-player.tsx:40` | `text-forest-700/70` |
| H18 | Mini-player close btn `text-sand-300` — fail | `mini-player.tsx:63` | Muted forest tone |
| H19 | Admin nav inactive `text-sand-300` — fail | `admin-mobile-nav.tsx:75` | `text-forest-700/60` like public nav |
| H20 | Input placeholder `text-sand-300` — fail | `input.tsx:13` | `placeholder:text-forest-700/50` |
| H21 | Search placeholder `text-sand-300` — fail | `search-input.tsx:52` | Darker placeholder + shorter mobile prompt |
| H22 | Dialog description `text-sand-300` — fail | `dialog.tsx:96` | `text-forest-700/70` |
| H23 | Dropdown label `text-sand-300` — fail | `dropdown-menu.tsx:72` | `text-forest-700/60` |
| H24 | EpisodeRow/download metadata `text-sand-300` — fail | `episode-row.tsx:48`, `download-row.tsx:35` | `text-forest-700/70` |
| H25 | Player timestamps `text-sand-300` — fail | `player-controls.tsx:48` | Darker token |

### Keyboard / A11y (5)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| H26 | Scrubber slider has `tabIndex=0` but no keyboard handlers | `scrubber.tsx:83` | Add Arrow/Home/End/Page keys or `<input type="range">` styled |
| H27 | Speed buttons lack `aria-pressed` / group role | `player-controls.tsx:86` | Wrap in `role="group"`, add `aria-pressed={s === speed}` |
| H28 | Form errors lack `aria-describedby` connection to inputs | `new-episode-form.tsx:278` | Point `aria-describedby` to error `id` |
| H29 | Dialog form errors lack `role="alert"` | `series-list.tsx:439`, `scholars-list.tsx`, `admins-list.tsx` | Add `role="alert"` on form error containers |
| H30 | Language toggle buttons lack `aria-pressed` | `scholars-list.tsx:502` | `aria-pressed={formLanguages.includes(lang.value)}` |

### Focus Visibility (4)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| H31 | Home card links no focus ring | `page.tsx:55` | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 rounded-lg` |
| H32 | Scholar row links no focus ring | `scholars/page.tsx:25` | Same |
| H33 | Series card links no focus ring | `scholar-tabs.tsx:30` | Same |
| H34 | Sheet close no focus ring | `sheet.tsx:78` | Same |
| H35 | Admin sheet links no focus ring | `admin-dashboard-shell.tsx:70,91` | Same |
| H36 | Logo link no focus ring | `header.tsx:37` | Same |
| H37 | Breadcrumb links no focus ring | `header.tsx:75` | Same |

### Admin Usability (5)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| H38 | Invite form asks super admin to paste raw Scholar UUID | `admins-list.tsx:495` | Terrible UX, error-prone on mobile | Fetch scholars, use `<Select>` with scholar names |
| H39 | `statusFilter` default check — empty list shows "No matching" instead of "Create" | `scholars-list.tsx:423` | Super admin can't see create CTA when all are empty | `statusFilter !== "all"` |
| H40 | Non-super admin on admins page throws generic error instead of redirect | `admins/page.tsx:9` | Confusing dashboard error UI | `redirect("/admin")` consistent with scholars page |
| H41 | Admin logo in header links to public `/`, admin logs out when tapping logo | `header.tsx:37` | Mobile admin exits CMS unintentionally | Accept admin href or link to `/admin` inside admin shell |
| H42 | Scholar admin see empty scholar select on episode form when no series | `episodes-list.tsx` | Confusing empty state with no guidance | Show contextual empty message: "No series for your scholar yet" |

### Reduced Motion (6)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| H43 | Skeleton `animate-pulse` not motion-safe | `skeleton.tsx:16,27` | `motion-safe:animate-pulse` |
| H44 | EpisodeRow skeleton `animate-pulse` raw | `episode-row.tsx:84` | `motion-safe:animate-pulse` |
| H45 | SeriesCard / FeaturedSeriesCard skeleton raw pulse | `series-card.tsx:49`, `featured-series-card.tsx:68` | `motion-safe:animate-pulse` |
| H46 | PlayButton loading spinner raw spin | `play-button.tsx:44` | `motion-safe:animate-spin` + static label fallback |
| H47 | Dialog overlay/content animations not gated | `dialog.tsx:33,51` | `motion-safe:` on animate-* classes, skip zoom on reduce |
| H48 | Sidebar width/chevron transitions not gated | `admin-sidebar.tsx:81,107` | `motion-safe:transition-all` |

### Performance (5)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| H49 | Search requests not abortable — stale fetches waste 3G bandwidth | `search/page.tsx:43`, `search-input.tsx:21` | Pass `AbortController.signal`, cancel in effect cleanup |
| H50 | Arabic font loads 4 weights globally (accent-only font) | `layout.tsx:16` | Limit to used weight; lazy-load |
| H51 | FeaturedSeriesCard image no `sizes` / no `priority` | `featured-series-card.tsx:23` | Add responsive `sizes` + `priority` (LCP candidate) |
| H52 | SeriesCard image no `sizes` | `series-card.tsx:19` | Add grid-aware `sizes` |
| H53 | Public layout is full client component → every page hydrates AudioProvider + Zustand | `public/layout.tsx:1` | Move shell to server, isolate client chrome in `<PublicChrome>` mounted after content |

### UX Missing from DESIGN.md (4)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| H54 | Bio clamped to 2 lines with no "Read more" | `scholars/[slug]/page.tsx:121` | Add expandable disclosure |
| H55 | Mini-player body not tappable (design says tap → expand to full player) | `mini-player.tsx:23` | Make title/body link to `/lectures/[slug]` |
| H56 | Lecture page lacks share in HeaderRight (design requires it) | `lecture-content.tsx` | Add `HeaderRight` share control |
| H57 | Language badges render raw enums (`yoruba`) not display labels (`Yoruba`) | `scholar-tabs.tsx`, `page.tsx` | Map to capitalized labels |

---

## 🔵 Medium

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| M1 | Storage usage hidden when download list empty | `downloads-content.tsx:69` | Always show `0 B used` |
| M2 | Metadata row overflows with many tags + duration on 360px | `episode-row.tsx:48` | Allow tag wrap or hide secondary tags at narrow widths |
| M3 | Search `autoFocus` on mobile opens keyboard, steals viewport | `search-input.tsx:54` | Gate on coarse-pointer or defer until explicit interaction |
| M4 | In-flight search requests not aborted on rapid typing | `search/page.tsx:56` | Abort stale requests via `AbortController.signal` |
| M5 | Non-R2 avatar images unoptimized → oversized on mobile | `avatar.tsx:69` | Configure remote patterns or proxy through R2 |
| M6 | Horizontal scroll sections lack `aria-label`, snap, scrollbar-none | `lecture-content.tsx:265`, `page.tsx:53` | Add `aria-label`, `snap-x`, `scrollbar-none` |
| M7 | Chip remove label ambiguous ("Remove") | `chip.tsx:41` | `aria-label={`Remove ${label}`}` |
| M8 | Skull `statusFilter` default check | `scholars-list.tsx:423` | Already listed in H39 |
| M9 | Admin loading uses generic Skeleton, not waveform | `admin/loading.tsx:1` | Replace with `WaveformSkeleton` |
| M10 | Login title uses "Admin" + logo, design says "Manhaj Admin" + WaveformSeal | `login/page.tsx:16` | Match `DESIGN.md` §4.8 branding |
| M11 | Clay variant exposed on generic `Badge` + `Button` — weakens "one clay per screen" rule | `badge.tsx:13`, `button.tsx:17` | Reserve clay for named contexts (donate, featured, sleep-timer) |
| M12 | Missing `text-body` (15px) and `text-caption` (12px) in theme tokens | `globals.css:25` | Add `--text-body: 15px; --text-caption: 12px` |
| M13 | No persistent offline guidance on lecture page when offline + not downloaded | `lecture-content.tsx:23` | Detect `navigator.onLine` / download availability; show persistent message |

---

## 🔹 Low

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| L1 | WaveformSeal uses array index keys | `waveform-seal.tsx:38` | `bar-${i}-${h}` if component ever animates |
| L2 | Admin collapsed sidebar sign-out has no `aria-label` | `admin-sidebar.tsx:144` | `aria-label="Sign out"` |
| L3 | Admin table/list rows have no responsive strategy for 360px | `scholars-list.tsx:339`, `series-list.tsx:311`, `episodes-list.tsx:244` | Stack metadata/actions below title on small screens (already C10-12 for worst cases) |
| L4 | Play failure silently flips state with no user feedback | `audio-provider.tsx:52` | Add non-intrusive player error state/toast |
| L5 | Dialog overlay zoom animation violates reduced-motion | `dialog.tsx:51` | Already flagged in H47, but note: skip zoom entirely |

---

## Cross-Cutting Themes

1. **Touch targets** — 15+ components below 44px minimum. Most impactful: scrubber, speed controls, chips, tabs, selects, dropdowns.
2. **Safe-area insets** — zero handling across nav, header, player. Every fixed-position element risks overlap with device chrome on modern Android/PWA.
3. **Contrast** — `text-sand-300` used as default muted text everywhere, fails 4.5:1 on `sand-50`/`sand-100` backgrounds. Needs systematic replacement.
4. **Reduced motion** — 6 animation sources not gated. Skeleton pulses, dialog zoom, sidebar transitions.
5. **Offline dead end** — downloaded blobs stored but player never feeds them back. Core MVP promise broken.
6. **Admin mobile overflows** — 3 list pages collapse on 360px. Need responsive card adaptation.
7. **Focus visibility** — 7+ interactive elements missing `focus-visible` rings. Keyboard navigation degraded.
8. **Client component creep** — public layout is all-client; every page hydrates player chrome regardless of playback state.
