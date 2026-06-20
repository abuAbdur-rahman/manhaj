# Manhaj — Business Requirements Document (BRD)
**Version:** 1.1 — MVP  
**Status:** Draft  
**Author:** Abu Abdirrahman  
**Last Updated:** June 2026 (v1.1 — added scoped multi-admin model, Next.js 16)

---

## 1. Project Overview

**Manhaj** is a focused audio lecture platform for Nigerian Sunni/Salafi scholars — primarily Yoruba-speaking — and their followers. It is not a general Islamic content hub. It is a curated, organized, offline-capable library tied to specific scholars the community already follows and trusts.

**Tagline (working):** *Ilm, organized.*

---

## 2. Problem Statement

Nigerian Salafi/Sunni scholar content is consumed massively but stored poorly:

- Lectures are scattered across WhatsApp groups, YouTube channels, Facebook pages, and Telegram
- No single place to find all of a specific scholar's lectures organized by series or topic
- Existing platforms (DawahNigeria, Muslim Central) are either not mobile-optimized, not scholar-specific, or not built for Nigeria's data/power constraints
- No reliable offline support — critical when data is expensive and power cuts are frequent
- Content gets lost when WhatsApp group admins go inactive or YouTube channels get flagged

---

## 3. Goals

### Business Goals
- Build a sustainable, low-cost platform that does not need to generate revenue to survive (Sadaqah Jariyah / donation model)
- Get at least 2 scholars actively using and endorsing the platform before launch
- Reach 500 active monthly users within 3 months of launch

### Product Goals
- Make it easy to find, stream, and download any lecture from supported scholars
- Outperform DawahNigeria on mobile UX and performance on mid/low-range Android devices
- Be the most organized Islamic audio library for Yoruba-speaking Nigerian Muslims

### Non-Goals (MVP)
- We are not building social features
- We are not hosting video content
- We are not building live streaming
- We are not allowing user-generated uploads
- We are not building for iOS first

---

## 4. Target Users

### Primary: The Listener (Mureed)
- Nigerian Muslim, 18–45, predominantly Yoruba-speaking
- Already follows one or more of the supported scholars
- Consumes lectures on a mid-range Android phone (₦80k–₦180k range)
- Shares content via WhatsApp regularly
- Frequently offline or on slow/expensive mobile data
- Pain points: can't find old lectures, loses downloaded WhatsApp audio files, buffering issues

### Secondary: Platform Admins (You + Scholar-Assigned Uploaders)
- Not a single person — each supported scholar has one or more trusted followers vetted to upload on their behalf
- You (the founder) hold a **super admin** role: full access across all scholars, manages other admins
- Each scholar-assigned uploader holds a **scholar admin** role: scoped to upload/edit/organize content for their assigned scholar only
- Logs in via a strict, individual account (not a shared password) — accountability matters since they're publishing on a scholar's behalf
- Needs a simple CMS to upload, tag, and organize content without writing code
- Cannot be online 24/7 — system must be low-maintenance, and no single admin going offline should block content from going up

### Future (v2+): The Scholar
- A Sheikh who wants to self-upload content
- Needs a simple upload portal with minimal friction
- Out of scope for MVP

---

## 5. MVP Feature Scope

### ✅ In Scope (v1)

#### 5.1 Scholar Profiles
- Name, photo, short bio
- Language(s) they lecture in (Yoruba / English / Hausa)
- Total lecture count
- Link to social handles (optional)

#### 5.2 Lecture Library
- Organized as: **Scholar → Series → Episodes**
- Each lecture has: title, scholar, series, language, duration, upload date, audio file
- Browse by: Scholar, Series, Recent uploads
- Filter by: Language

#### 5.3 Audio Player
- Play / Pause / Seek
- Playback speed (0.75x, 1x, 1.25x, 1.5x, 2x)
- Sleep timer (15 / 30 / 60 min)
- Background playback (keeps playing when screen is off)
- Persistent mini-player across pages

#### 5.4 Offline Download
- Download any lecture to device storage
- View and manage downloaded lectures
- Plays without internet connection once downloaded
- This is the #1 differentiator from DawahNigeria

#### 5.5 Search
- Search by: lecture title, scholar name, series name, topic tags
- Results ranked by relevance (not just date)
- Instant/debounced search (no full-page reload)

#### 5.6 Share
- Every lecture has a shareable link
- Link preview shows scholar name + lecture title (Open Graph meta)
- One-tap "Share via WhatsApp" button
- Link opens directly to that lecture on the platform

#### 5.7 Home / Discovery
- Recently added lectures (last 10)
- Featured series (manually curated by admin)
- Scholar list (browse all)

#### 5.8 Admin Roles & Permissions
- Individual admin accounts — no shared password
- Two roles:
  - **Super admin** (founder) — full access: manage scholars, series, episodes, and other admins across the whole platform
  - **Scholar admin** (scholar-assigned uploader) — scoped access: can only create/edit/publish series and episodes for their assigned scholar; cannot see or touch other scholars' content or admin management
- Super admin can invite, deactivate, or reassign a scholar admin at any time
- All publish/edit actions are attributable to the admin who performed them (basic audit trail: who uploaded, when)

---

### ❌ Out of Scope (v1)

| Feature | Deferred To |
|---|---|
| Listener accounts / login | v2 — *admin accounts are different and are in scope for v1, see 5.8* |
| Bookmarks / favorites | v2 |
| Playback history sync | v2 |
| Comments / discussion | v2 |
| Push notifications | v2 |
| Video content | v3 |
| Live streaming | v3 |
| Scholar upload portal | v2 |
| Subscription / paid content | v3 |
| iOS app | v2 |
| Dark mode | v1.5 (low effort, add if time allows) |
| Multi-language UI (Yoruba/Arabic) | v2 |

---

## 6. Content Strategy

### Curation Model (MVP)
- Content is uploaded and managed by platform admin only (no user uploads)
- All content uploaded with explicit scholar permission
- Sources: scholar's WhatsApp broadcasts, recorded programs, masjid recordings
- Attribution is always displayed and correct

### Initial Scholar Target (3 at launch minimum)
- Dr. Sharafudeen Raji Gbadebo
- Sheikh Oniwiridi (confirm name + contact)
- Sheikh Ejigbo (confirm name + contact)

### Content Intake Process
1. Scholar's assigned admin receives audio file (WhatsApp, email, direct recording)
2. Admin cleans audio if needed (trim silence, normalize volume — basic)
3. Admin uploads to Cloudflare R2 via the admin portal
4. Admin creates episode entry in Supabase (title, series, tags, duration) — scoped to their own scholar
5. Content goes live (optionally after super admin review, see Section 7 admin roles)

### Tagging Taxonomy (start simple)
Topics: Aqeedah · Fiqh · Tafseer · Hadith · Seerah · Manhaj · Adab · Family · Ibadah · Dawah

---

## 7. Technical Requirements

### Platform
- **Phase 1 (MVP):** Web app — PWA, installable from browser
- **Phase 2:** React Native mobile app (Android-first)

### Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 16+ (App Router) | SSR for SEO + performance, you know React |
| Styling | Tailwind CSS | Fast to build, consistent |
| Audio Player | Howler.js or native HTML5 Audio | Solid, well-maintained |
| Backend / DB | Supabase (Postgres + Auth) | Free tier, Auth (now used for scoped admin login), Storage, Realtime |
| File Storage | Cloudflare R2 | Near-zero egress cost, great CDN |
| Deployment | Vercel | Free tier, auto-deploy, Edge functions |
| Search | Postgres full-text search (pg_trgm) | No extra infra until scale demands it |
| Admin Panel | Custom Next.js admin routes + Supabase Auth (role-based) | Individual logins per admin, scoped by role — not Supabase Studio, since multiple non-technical uploaders need a real UI |

### Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load (3G) | < 3 seconds on first load |
| Audio start latency | < 2 seconds on 4G |
| Offline playback | Works on downloaded files, 100% |
| PWA installable | Yes — Add to Home Screen on Android Chrome |
| Shareable links | Every lecture has a unique, permanent URL |
| SEO | Scholar + lecture pages indexed by Google |
| Uptime | 99%+ (Vercel + Cloudflare handles this) |

### Data Model (Core)

```
scholars
  - id
  - name
  - slug              (for URL: /scholars/dr-sharaf)
  - bio
  - photo_url
  - languages[]       (yoruba | english | hausa)
  - created_at

series
  - id
  - scholar_id        → scholars.id
  - title
  - description
  - cover_url
  - slug
  - created_at

episodes
  - id
  - series_id         → series.id
  - scholar_id        → scholars.id  (denormalized for fast queries)
  - title
  - slug
  - audio_url         (Cloudflare R2 URL)
  - duration_seconds
  - language          (yoruba | english | hausa)
  - tags[]
  - description
  - recorded_date
  - created_at

tags (optional, can be a simple text array first)
  - id
  - name
  - slug

admins
  - id                 → auth.users.id (Supabase Auth)
  - name
  - email
  - role               (super_admin | scholar_admin)
  - scholar_id         → scholars.id  (null for super_admin, required for scholar_admin)
  - is_active
  - invited_by         → admins.id
  - created_at
```

---

## 8. URL Structure

```
/                           → Home
/scholars                   → All scholars
/scholars/[slug]            → Scholar profile + all their series
/scholars/[slug]/[series]   → Series page + all episodes
/lectures/[slug]            → Individual lecture (shareable, SEO'd)
/search?q=...               → Search results
/downloads                  → Downloaded lectures (local storage / PWA)
/admin                      → Protected admin panel
```

---

## 9. Design Principles

- **Content first.** The lecturer's voice is the product. Don't decorate around it.
- **Low-data respectful.** Lazy load audio. Don't autoplay. Let user choose.
- **Built for Android mid-range.** Test on a ₦80k phone. If it lags there, fix it.
- **Arabic/Islamic aesthetic, not generic blue SaaS.** Think warm neutrals, green accents, clean Arabic typography touches.
- **No clutter.** No sidebar. No notifications badges. No engagement metrics. Just content.

---

## 10. Sustainability Model

### Cost Structure (monthly estimate)

| Item | Cost |
|---|---|
| Supabase (free tier) | ₦0 |
| Vercel (free tier) | ₦0 |
| Cloudflare R2 (first 10GB free, then ~$0.015/GB) | ~₦0–₦500 early on |
| Domain (.ng) | ~₦5,000/year |
| **Total MVP running cost** | **< ₦1,000/month** |

### Revenue / Funding Model
- **No ads** (this is a feature, not a compromise)
- **Sadaqah Jariyah donations** — small prominent button, framed as ongoing reward
- Scholars can optionally ask their followers to support the platform
- If donations grow, upgrade to Supabase Pro (₦10,000/month) for more capacity

---

## 11. Launch Checklist (Before v1 Goes Live)

- [ ] At least 2 scholars confirmed and content permission obtained
- [ ] At least 1 scholar-assigned admin onboarded and trained per launch scholar
- [ ] Admin roles tested — scholar admin cannot see/edit another scholar's content
- [ ] Minimum 50 lectures uploaded, tagged, and organized into series
- [ ] PWA installable and working offline on Android Chrome
- [ ] All lecture pages indexed and shareable with proper Open Graph preview
- [ ] Search working for all uploaded content
- [ ] Audio player works in background (screen off)
- [ ] Download + offline playback tested on low-end device
- [ ] Share via WhatsApp button tested and working
- [ ] Admin can upload new content without touching code
- [ ] Domain live, Cloudflare CDN configured
- [ ] At least 1 sheikh has shared the platform with his followers

---

## 12. Success Metrics (3 months post-launch)

| Metric | Target |
|---|---|
| Monthly active users | 500+ |
| Total lectures available | 200+ |
| Scholars on platform | 3+ |
| Lecture downloads (offline) | 1,000+ |
| WhatsApp shares tracked | 200+ |
| Platform uptime | 99%+ |

---

## 13. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Scholar doesn't actively promote it | High | Get written endorsement before building, not after |
| Content upload becomes a burden | Medium | Mitigated by design — each scholar has their own assigned admin(s), not a single bottleneck; still build a simple admin UI early |
| A scholar admin account is compromised or misused | Low–Medium | Individual logins (not shared passwords), scoped permissions per scholar, super admin can deactivate instantly |
| Audio hosting cost grows fast | Medium | Cloudflare R2 is cheap; alert at 50GB |
| DawahNigeria copies the UX | Low | Our moat is scholar relationships, not features |
| Dev burnout / abandonment | Medium | Keep scope ruthlessly small; ship v1 in 6 weeks max |
| Poor audio quality from source recordings | High | Set quality standards upfront with scholars; normalize on upload |

---

## 14. Build Timeline (Rough)

| Week | Milestone |
|---|---|
| 1 | Setup repo, Supabase schema, R2 bucket, basic Next.js scaffold |
| 2 | Scholar profiles + series + episode pages (read-only, no player yet) |
| 3 | Audio player (stream + background playback) |
| 4 | Offline download + PWA configuration |
| 5 | Search + filtering |
| 6 | Admin upload flow + content ingestion (upload 50 lectures) |
| 7 | Polish, test on low-end Android, share + Open Graph |
| 8 | Soft launch with scholars → get feedback → iterate |

---

*"Ilm, organized." — Manhaj v1*
