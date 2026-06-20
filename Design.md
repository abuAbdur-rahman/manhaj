# Manhaj — Design Document
**Version:** 1.0
**Scope:** Mobile-first UI/UX design for MVP (v1), aligned to BRD v1.1 and Setup v1.2
**Status:** Draft

---

## 1. Design Brief Recap

Manhaj is a curated audio library for Nigerian Yoruba-speaking Salafi scholars, used on mid-range Android phones, often on slow data or offline. The product has exactly one job per screen: **get the listener to the right lecture, fast, and let them take it offline.** Nothing in this design should compete with that.

Design must hold up against three constraints from the BRD:
- **Network:** assume 3G, assume the connection drops mid-session.
- **Device:** test-fit for a ₦80k Android phone — small screen, modest GPU, no room for animation-heavy chrome.
- **Audience:** a Yoruba-speaking Muslim audience who already trusts these scholars — the design should feel like a well-kept maktabah (library), not a startup dashboard.

---

## 2. Design Token System

### 2.1 Color

Building on the tokens already defined in `app/globals.css`. The palette is restrained on purpose: green carries trust and is reserved for action, gold is used as a rare accent (never a background), sand carries almost the entire surface area.

| Token | Hex | Role |
|---|---|---|
| `forest-900` | `#07200f` | Primary text |
| `forest-700` | `#0f4126` | Headings on light surfaces |
| `forest-600` | `#155732` | Hover/active state of primary actions |
| `forest-500` | `#1a6b3c` | Primary action (play, download, save) |
| `forest-100` | `#dcede6` | Selected/active chip background |
| `forest-50` | `#f0f7f4` | Subtle section tint |
| `sand-50` | `#fafaf7` | App background |
| `sand-100` | `#f5f3ec` | Card surface |
| `sand-200` | `#eae6d9` | Borders, dividers |
| `sand-300` | `#d9d3c0` | Disabled/inactive |
| `gold-500` | `#b8962e` | Signature accent — featured badge, sleep-timer ring, donate button only |
| `gold-400` | `#c9a84c` | Gold hover state |

**Rule:** gold appears in at most one element per screen. If everything is gold, nothing is.

### 2.2 Typography

- **Display / body:** Geist Sans — clean, neutral, performs well at small sizes on low-DPI screens.
- **Arabic accents:** Noto Naskh Arabic — used only for: scholar name diacritics where relevant, the small ﷽-style mark in the splash/empty states, and section dividers. Never used for body UI copy (keeps load light, keeps legibility).
- **Numerals/duration/timestamps:** Geist Mono via `--font-geist-mono` — anything that is a number a user scans (duration, file size, download %) uses mono so digits don't jiggle.

| Style | Size (mobile) | Weight | Use |
|---|---|---|---|
| Display | 24px / 1.2 | 600 | Scholar name on profile, lecture title on player |
| Title | 18px / 1.3 | 600 | Card titles, section headers |
| Body | 15px / 1.5 | 400 | Descriptions, bios |
| Label | 13px / 1.4 | 500 | Tags, metadata, nav labels |
| Caption | 12px / 1.4 | 400 | Timestamps, durations (mono) |

Base size floor is 15px — never go below that on body text; this is a listening app for a wide age range, including older listeners.

### 2.3 Spacing & Radius

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 (Tailwind defaults, no custom scale needed).
- Radius: `8px` for cards and buttons, `999px` (full) for pills/tags and the play button. No sharp corners — the product should feel soft and approachable, not corporate.
- Touch targets: **44×44px minimum**, 48px for primary actions (play, download). This is non-negotiable for a thumb-driven, one-handed, often-on-the-move audience.

### 2.4 Signature Element

**The waveform seal.** A single, quiet recurring motif: a short abstracted horizontal waveform (5–7 bars, forest-500, varying heights) used as:
- the loading/skeleton state for audio rows (animates as a gentle pulse, respects `prefers-reduced-motion`),
- a watermark behind the scholar's photo on their profile header (low opacity, forest-50 on sand-50),
- the favicon/app icon motif.

It ties every screen back to "this is an audio library" without resorting to generic podcast-app cliché icons (headphones, microphones). One motif, used sparingly, is the entire visual signature — no other illustration system is needed.

---

## 3. Layout System (Mobile-First)

### 3.1 Breakpoints

| Name | Width | Notes |
|---|---|---|
| `base` | 0–639px | **Primary target.** Design and build for this first. |
| `sm` | 640px+ | Larger phones / phablets — mostly just more breathing room |
| `md` | 768px+ | Tablet — introduce 2-column grids |
| `lg` | 1024px+ | Desktop — admin panel's real home; public site gets a centered column (max 720px) rather than stretching wide |

The public-facing app is never designed "down" from desktop. It is designed up from a 360px viewport (a common low-end Android width) and capped at a comfortable reading column on larger screens.

### 3.2 Navigation Shell (public app)

Bottom tab bar, not a sidebar (per BRD §9: "No sidebar"). Fixed, 56px tall, sand-100 background, sits above the mini-player when one is active.

```
┌─────────────────────────────┐
│                              │
│         (page content)      │
│                              │
├─────────────────────────────┤
│ ▶ Lecture Title  · 12:03 ⏸  │  ← mini-player (only when playing)
├─────────────────────────────┤
│  🏠      📚      🔍     ⬇   │
│ Home  Scholars Search  Saved │
└─────────────────────────────┘
```

- Icons are simple line icons (lucide-react), 22px, label always visible (no icon-only nav — clarity over density).
- Active tab: forest-600 icon + label, sand-50 underline pip.
- The mini-player is part of the navigation shell, not the page — it persists across all four tabs per BRD §5.3.

### 3.3 Page Template

One structural template, two surfaces. Every screen in §4 is an instance of one of these — no screen invents its own header or nav pattern.

```
┌─────────────────────────────────────────────┐
│ Header                                        │
│  [Logo / Back]  Page Title  or  Scholar > Series   [Page actions]
├──────────┬────────────────────────────────────┤
│ Sidebar  │                                     │
│ (desktop,│           Page content              │
│ admin    │                                     │
│ only,    │                                     │
│ collaps- │                                     │
│ ible)    │                                     │
├──────────┴────────────────────────────────────┤
│         Floating Nav (mobile only)             │
└─────────────────────────────────────────────┘
```

**Header — same anatomy on every screen, public and admin:**

| Zone | Content | Rule |
|---|---|---|
| Left | Logo (root screens: Home, Admin dashboard) **or** `←` Back **or** breadcrumb (`Scholar > Series`, admin only) | Root tabs get the logo; everything one level deep gets `←` + the immediate parent's name, not a generic "Back"; admin uses full breadcrumb since admins jump between scopes |
| Center/inline | Page title | Always present, even when the left zone already shows it via breadcrumb (keeps height consistent — title never disappears) |
| Right | Page actions (0–2 max) | e.g. `Share` on the lecture page, `+ New episode` on admin dashboard. Never more than 2 — a third action moves into a `⋯` menu |

Fixed header height: **56px** on both surfaces, sand-50 background, 1px sand-200 border-bottom. Content padding below the header: **16px** horizontal on `base`, **24px** from `md` up — this is the one rule every §4 wireframe should be read against, even where the ASCII art doesn't show it.

**Sidebar — admin only, desktop only (`lg`+):**
- 240px expanded / 64px icon-only collapsed, sand-100 background, persists collapse state in local UI state.
- Contains: Dashboard, Scholars (super admin only), Admins (super admin only), Series, Episodes, sign out.
- Scholar admins see the same sidebar shape with the scoped items only — no disabled/grayed-out items for things they can't access (don't show what they can't use).
- Below `lg`, the sidebar disappears entirely and admin falls back to the floating nav, same as public.

**Floating Nav — mobile, both surfaces, but different content:**
- **Public:** the bottom tab bar already specified in §3.2 (Home / Scholars / Search / Downloads) — this *is* the floating nav for the public app.
- **Admin (mobile):** a condensed 4-item version — Dashboard / Episodes / Series / Menu (the `Menu` item surfaces Scholars/Admins/sign out as a sheet, since those are super-admin-only and shouldn't take a permanent tab slot for scholar admins who can't use them).
- Identical visual spec either way: 56px, fixed, sand-100, sits above the mini-player on public screens.

This means: **a screen is only "designed" once its header zone content and page actions are decided** — the chrome around it is never a fresh decision.

---

## 4. Screen Designs

Each wireframe below shows page content only — header, sidebar (admin/desktop), and floating nav are the shared shell from §3.3 and aren't redrawn per screen. Header left/right zones are called out in prose under each wireframe where they're not obvious.

### 4.1 Home (`/`)

```
┌─────────────────────────────┐
│  Manhaj            🔍       │  ← wordmark, search icon (not a search bar — keeps header light)
│  Ilm, organized.            │
├─────────────────────────────┤
│  Recently added              │
│  ┌────┐┌────┐┌────┐         │  ← horizontal scroll, episode cards
│  │ 🎧 ││ 🎧 ││ 🎧 │  →      │
│  └────┘└────┘└────┘         │
├─────────────────────────────┤
│  Featured series             │
│  ┌──────────────────────┐   │
│  │ Cover image            │   │  ← full-width featured card,
│  │ Series title            │   │     admin-curated (BRD §5.7)
│  │ Scholar · 24 episodes   │   │
│  └──────────────────────┘   │
├─────────────────────────────┤
│  Scholars                    │
│  ◯ Dr. Sharafudeen           │  ← round avatar + name row,
│  ◯ Sheikh Oniwiridi           │     tap → scholar profile
│  ◯ Sheikh Ejigbo               │
│  See all scholars →          │
└─────────────────────────────┘
```

Design intent: three honest sections, no hero banner, no carousel auto-rotate (autoplay anything is against BRD §9 "don't autoplay, let user choose" — extends to UI motion, not just audio).

### 4.2 Scholar Profile (`/scholars/[slug]`)

```
┌─────────────────────────────┐
│  ← Back                      │
│      ◯ (photo, 96px)         │
│    Dr. Sharafudeen Raji       │
│    Gbadebo                    │
│   Yoruba · English            │
│   "Short bio, 2 lines max     │
│    visible, Read more"        │
│   [ 🔗 WhatsApp ] [ YouTube ] │
├─────────────────────────────┤
│  Tabs: [Series] [All Episodes]│
├─────────────────────────────┤
│  ┌──────────┐ ┌──────────┐   │
│  │ Series A │ │ Series B │   │  ← 2-col grid, cover + title +
│  │ 18 eps   │ │  9 eps   │   │     episode count
│  └──────────┘ └──────────┘   │
└─────────────────────────────┘
```

The waveform-seal watermark sits behind the photo at ~6% opacity — subtle, not decorative clutter.

### 4.3 Series Page (`/scholars/[slug]/[series]`)

```
┌─────────────────────────────┐
│  ← Series title               │
│  Scholar name · 18 episodes  │
│  [▶ Play all] [⬇ Download all]│
├─────────────────────────────┤
│  1. Episode title       32:10│
│     Yoruba · Aqeedah    ⬇    │  ← row list, not cards —
│  2. Episode title       28:44│     scannable at speed,
│     Yoruba · Fiqh       ⬇    │     one tap = play
│  3. Episode title       41:02│
│     ...                      │
└─────────────────────────────┘
```

Each row: tap anywhere = play; the ⬇ icon is its own 44px tap target (independent from play, so a listener can queue downloads on Wi-Fi without starting playback on data).

### 4.4 Lecture / Episode Page (`/lectures/[slug]`) — shareable, SEO'd

```
┌─────────────────────────────┐
│  ← Back              ⋯ Share │
│                              │
│        ▶  (large play)       │
│   Episode title               │
│   Scholar · Series             │
│   Yoruba · 32:10 · Aqeedah    │
│                              │
│  ──●───────────────  12:03   │  ← scrubber
│  ⏮  ⏯  ⏭     1x  ⏰          │  ← speed, sleep timer
│                              │
│  [ ⬇ Download ] [📤 WhatsApp]│
├─────────────────────────────┤
│  Description text...         │
│  Recorded: 14 Jan 2026        │
├─────────────────────────────┤
│  More from this series →     │
└─────────────────────────────┘
```

This page is the canonical share target (BRD §5.6) — Open Graph image is auto-generated: scholar photo + lecture title on a sand-50 card, no external image dependency so it renders even on slow WhatsApp link previews.

### 4.5 Mini-Player (persistent, all pages)

```
┌─────────────────────────────┐
│ ◯ Episode title       ⏯  ⏹  │  ← 56px tall, tap body to expand
│   Scholar · 12:03 / 32:10    │     to full player (4.4)
└─────────────────────────────┘
```

### 4.6 Search (`/search`)

```
┌─────────────────────────────┐
│  ← [ Search lectures...   ] │  ← input auto-focused on tab tap
├─────────────────────────────┤
│  Filter: [Yoruba][English]   │  ← pill filters, multi-select
├─────────────────────────────┤
│  Results (debounced, ~300ms) │
│  Episode title         32:10 │
│  Scholar · Series             │
│  ...                          │
└─────────────────────────────┘
```

Empty state (no query yet): show "Recent searches" if any, else a short prompt — *"Search by scholar, series, or topic — try 'Aqeedah'."* Empty results state: *"Nothing found for '___'. Try a scholar's name or a topic like Fiqh."* — instructive, not apologetic, per the interface-voice convention.

### 4.7 Downloads (`/downloads`)

```
┌─────────────────────────────┐
│  Downloads        2.1 GB used│
├─────────────────────────────┤
│  Episode title          32:10│
│  Downloaded 3 days ago    🗑  │
│  ...                          │
├─────────────────────────────┤
│  (empty state)                │
│   ⬇  Nothing downloaded yet   │
│   Tap ⬇ on any lecture to     │
│   listen without data.        │
└─────────────────────────────┘
```

Storage total shown up top at all times — respects the "data is expensive" reality; the user should never be surprised by storage use.

### 4.8 Admin — Login (`/admin/login`)

```
┌─────────────────────────────┐
│        Manhaj Admin           │
│   ┌───────────────────────┐ │
│   │ Email                  │ │
│   └───────────────────────┘ │
│   ┌───────────────────────┐ │
│   │ Password                │ │
│   └───────────────────────┘ │
│   [        Log in          ]│
└─────────────────────────────┘
```

Deliberately plain — no marketing copy, individual accounts only (BRD §5.8), no "forgot password / sign up" self-serve flow in MVP since accounts are invite-only.

### 4.9 Admin — Dashboard (role-aware)

Header: left = logo (Dashboard is the admin root), right = `Abu A. ▾` (account menu). Desktop adds the sidebar from §3.3 to the left; mobile relies on the floating nav.

```
┌──────────┬──────────────────────┐
│ Sidebar  │  + New episode  + New series  │
│ Dashboard│ ┌──────────────────────────┐ │
│ Scholars │ │ Your scope: Dr. Sharafudeen│ │ ← scholar_admin only;
│ Admins   │ └──────────────────────────┘ │    super_admin sees
│ Series   │  Recent uploads               │    a scholar count
│ Episodes │  Episode title   Published ✓ │    summary instead
│ Sign out │  Episode title   Draft       │
│          │  Episode title   Draft       │
└──────────┴──────────────────────┘
```

Scholar admins get the same sidebar shape, scoped — `Scholars` and `Admins` simply aren't rendered for that role, per §3.3's "don't show what they can't use" rule.

### 4.10 Admin — New Episode

Header: left = breadcrumb `Episodes > New`, right = none (Save/Publish live in page content, not the header, since they need the form's validation state).

```
┌─────────────────────────────┐
│  Title          [_________]  │
│  Series         [▾ select ]  │  ← scoped to admin's scholar
│  Language       [▾ Yoruba ]  │
│  Tags           [Aqeedah ×]  │
│  Audio file     [⬆ Upload ]  │
│   ▓▓▓▓▓▓░░░░  62%  uploading │  ← R2 multipart progress
│  Recorded date  [__/__/____] │
│  Description    [_________]  │
│  [ Save draft ]  [ Publish ] │
└─────────────────────────────┘
```

Upload progress is honest and granular (percentage + bar), since admins may be uploading large files on the same constrained connections as listeners.

---

## 5. Component States

Every list/card component needs three states designed, not just the happy path:

| State | Treatment |
|---|---|
| **Loading** | Waveform-seal skeleton pulse (signature element, see §2.4), never a generic gray box |
| **Empty** | One line explaining what goes here + the action that fills it, in the interface's voice — never "No data" |
| **Error** | What happened + what to do, no apology, no stack traces. e.g. *"Couldn't load this lecture. Check your connection and try again."* with a retry button |

Offline-specific state: if a user opens a lecture page with no connection and the file isn't downloaded, show: *"You're offline and this lecture isn't downloaded yet. Connect to play, or download lectures in advance from the Downloads tab."*

---

## 6. Accessibility & Performance

- Color contrast: forest-900 on sand-50 = 15.8:1 (AAA). forest-500 on sand-50 = 6.1:1 (AA for normal text). Never place body text in gold.
- All icon-only controls (download, share, play in lists) carry `aria-label`s describing the action + subject ("Download: Episode title"), not just "Download."
- Visible focus rings (forest-500, 2px) on every interactive element — admins will often be on desktop/keyboard.
- `prefers-reduced-motion` disables the waveform pulse and any transition beyond opacity fades.
- No web fonts block first paint: `font-display: swap` on Geist + Noto Naskh Arabic; Arabic font loads lazily since it's accent-only.
- Images: scholar photos and series covers lazy-load below the fold; served via Cloudflare R2 + Next/Image with explicit width/height to avoid layout shift on slow connections.
- Audio never autoplays on page load — first tap is always the user's.

---

## 7. What This Design Deliberately Avoids

- No skeuomorphic "cassette tape" or "prayer beads" UI gimmicks — respect the content, don't theme it.
- No engagement mechanics: no streak counters, no badges, no "X people listening now."
- No dense admin dashboard charts in MVP — admins need an upload flow, not analytics.
- No dark mode in this pass (BRD defers it to v1.5) — token system above is structured so a dark variant (swap sand/forest luminance, keep gold as-is) can be added later without a redesign.

---

*Companion to: `manhaj-brd-v1.1.md` (requirements) and `manhaj-setup-v1.2.md` (stack/schema).*
