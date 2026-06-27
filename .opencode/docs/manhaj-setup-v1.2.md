# Manhaj — Project Setup (v1.2)
**Stack:** Next.js 16 (App Router, TypeScript, Turbopack) · Supabase (DB + Auth) · Cloudflare R2 · Vercel  
**Node version:** 20+  
**Package manager:** pnpm

---

<!--
Next.js: 16.2.9
React: 19.2.4
TypeScript: ^5

Dependencies:
  @aws-sdk/client-s3: ^3.1073.0
  @aws-sdk/s3-request-presigner: ^3.1073.0
  @serwist/next: ^9.5.11
  @supabase/ssr: ^0.12.0
  @supabase/supabase-js: ^2.108.2
  clsx: ^2.1.1
  howler: ^2.2.4
  slugify: ^1.6.9
  tailwind-merge: ^3.6.0
  zustand: ^5.0.14

Dev Dependencies:
  @biomejs/biome: 2.2.0
  @tailwindcss/postcss: ^4
  @types/howler: ^2.2.13
  @types/node: ^20
  @types/react: ^19
  @types/react-dom: ^19
  babel-plugin-react-compiler: 1.0.0
  supabase: ^2.107.0
  tailwindcss: ^4
  typescript: ^5
-->

---

## Prerequisites

```bash
node --version    # >= 20
pnpm --version    # >= 9
```

---

## 1. Install Dependencies

Run the following command to add dependencies to your existing Next.js 16 installation:

```bash
pnpm add @supabase/supabase-js @supabase/ssr zustand howler @serwist/next serwist clsx tailwind-merge slugify @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

pnpm add -D @types/howler supabase
```

### Current package.json (audited)

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.1073.0",
    "@aws-sdk/s3-request-presigner": "^3.1073.0",
    "@serwist/next": "^9.5.11",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.2",
    "clsx": "^2.1.1",
    "howler": "^2.2.4",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "serwist": "^9.5.11",
    "slugify": "^1.6.9",
    "tailwind-merge": "^3.6.0",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.0",
    "@tailwindcss/postcss": "^4",
    "@types/howler": "^2.2.13",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "supabase": "^2.107.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 2. Project Directory Structure

```
manhaj/
├── app/
│   ├── globals.css                     # Tailwind v4 + custom theme
│   ├── layout.tsx                      # Root layout (fonts, metadata, viewport)
│   ├── page.tsx                        # Home page (placeholders)
│   ├── sw.ts                           # Serwist service worker
│   └── favicon.ico
├── components/
│   └── ui/
│       └── cn.ts                       # clsx + twMerge utility
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client (SSR cookies)
│   │   └── admin.ts                    # Admin client (service role key)
│   ├── auth.ts                         # getCurrentAdmin() + requireAdmin()
│   ├── audio.ts                        # formatDuration, parseDurationString
│   ├── r2.ts                           # R2 upload via S3 Client
│   └── utils.ts                        # requireEnv() helper
├── store/
│   └── player.ts                       # Zustand player store
├── types/
│   └── index.ts                        # Shared TypeScript types
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── icon-maskable-512x512.png
│   ├── manifest.json
│   ├── robots.txt
│   └── *.svg                           # Placeholder SVGs (Next.js defaults)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Full schema + RLS + policies
├── proxy.ts                            # Admin route guard (Next.js 16 proxy)
├── next.config.ts
├── tsconfig.json
├── pnpm-workspace.yaml                 # Ignored (single-package repo)
├── .env.local
├── .env.example
├── .gitignore
└── package.json
```

### Not yet built (planned in doc, absent from codebase)

```
app/(public)/
├── layout.tsx
├── page.tsx
├── scholars/
│   ├── page.tsx
│   ├── [slug]/
│   │   ├── page.tsx
│   │   └── [series]/
│   │       └── page.tsx
├── lectures/
│   └── [slug]/
│       └── page.tsx
├── search/
│   └── page.tsx
└── downloads/
    └── page.tsx

app/(admin)/
└── admin/
    ├── login/
    │   └── page.tsx
    ├── layout.tsx
    ├── page.tsx
    ├── scholars/
    │   └── page.tsx
    ├── admins/
    │   └── page.tsx
    ├── series/
    │   └── page.tsx
    └── episodes/
        ├── page.tsx
        └── new/
            └── page.tsx

app/api/
├── search/
│   └── route.ts
├── episodes/
│   └── [slug]/
│       └── play/
│           └── route.ts
└── admin/
    ├── scholars/
    │   └── route.ts
    ├── admins/
    │   └── route.ts
    ├── series/
    │   └── route.ts
    ├── episodes/
    │   └── route.ts
    └── upload/
        └── route.ts

components/
├── player/
│   ├── AudioPlayer.tsx
│   ├── MiniPlayer.tsx
│   └── SleepTimer.tsx
├── scholars/
│   ├── ScholarCard.tsx
│   └── ScholarHeader.tsx
├── episodes/
│   ├── EpisodeCard.tsx
│   ├── EpisodeRow.tsx
│   └── EpisodeList.tsx
├── series/
│   ├── SeriesCard.tsx
│   └── SeriesGrid.tsx
└── ui/
    ├── SearchBar.tsx
    ├── DownloadButton.tsx
    ├── ShareButton.tsx
    └── LanguageBadge.tsx

hooks/
├── useAudioPlayer.ts
├── useDownload.ts
└── useSearch.ts
```

---

## 3. Environment Variables

### `.env.example`

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Manhaj

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=manhaj
NEXT_PUBLIC_R2_PUBLIC_URL=

ADMIN_BOOTSTRAP_EMAIL=
ADMIN_BOOTSTRAP_SECRET=
```

> **Note:** Codebase uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `PUBLISHABLE_KEY`). All lib files + `proxy.ts` reference `ANON_KEY`.

---

## 4. Configuration Files

### `next.config.ts`

```typescript
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.cloudflarestorage.com" },
    ],
  },
  serverExternalPackages: ["@aws-sdk/client-s3"],
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
```

### `app/sw.ts`

```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  RangeRequestsPlugin,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /\.(?:mp3|wav|ogg)$/i,
      handler: new CacheFirst({
        cacheName: "manhaj-audio",
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 2592000 }),
          new RangeRequestsPlugin(),
        ],
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|webp|svg)$/i,
      handler: new CacheFirst({
        cacheName: "manhaj-images",
        plugins: [
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 604800 }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
```

### `app/globals.css` (Tailwind CSS v4 Configuration)

```css
@import "tailwindcss";

@theme {
  --color-forest-50: #f0f7f4;
  --color-forest-100: #dcede6;
  --color-forest-500: #1a6b3c;
  --color-forest-600: #155732;
  --color-forest-700: #0f4126;
  --color-forest-900: #07200f;

  --color-sand-50: #fafaf7;
  --color-sand-100: #f5f3ec;
  --color-sand-200: #eae6d9;
  --color-sand-300: #d9d3c0;

  --color-gold-400: #c9a84c;
  --color-gold-500: #b8962e;

  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-arabic: "Noto Naskh Arabic", serif;
}
```

### `app/layout.tsx`

```typescript
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Manhaj — Ilm, organized.",
    template: "%s — Manhaj",
  },
  description:
    "A focused audio lecture platform for Nigerian Sunni/Salafi scholars. Stream, download, and organize lectures from trusted scholars.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Manhaj — Ilm, organized.",
    description:
      "Stream and download audio lectures from trusted Nigerian Sunni/Salafi scholars.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a6b3c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoNaskhArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-sand-50 text-forest-900 font-sans">
        {children}
      </body>
    </html>
  );
}
```

---

## 5. TypeScript Types

### `types/index.ts`

```typescript
export type Language = "yoruba" | "english" | "arabic";

export type Speed = 0.75 | 1 | 1.25 | 1.5 | 2;

export type Tag =
  | "aqeedah"
  | "fiqh"
  | "tafseer"
  | "hadith"
  | "seerah"
  | "manhaj"
  | "adab"
  | "family"
  | "ibadah"
  | "dawah"
  | "ruqyah"
  | "arabic";

export interface Scholar {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  languages: Language[];
  social_links: {
    youtube?: string;
    telegram?: string;
    whatsapp?: string;
    website?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  series_count?: number;
  episode_count?: number;
}

export type AdminRole = "super_admin" | "scholar_admin";

export interface Series {
  id: string;
  scholar_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  scholar?: Scholar;
  episode_count?: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  scholar_id: string | null;
  is_active: boolean;
  invited_by: string | null;
  created_at: string;
}

export interface Episode {
  id: string;
  series_id: string | null;
  scholar_id: string;
  title: string;
  slug: string;
  description: string | null;
  audio_url: string;
  duration_seconds: number | null;
  language: Language;
  tags: Tag[];
  recorded_date: string | null;
  play_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  scholar?: Scholar;
  series?: Series | null;
}

export interface PlayerState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: Speed;
  isLoading: boolean;
  sleepTimer: number | null;
}

export interface DownloadedEpisode {
  episode: Episode;
  downloadedAt: string;
  cacheKey: string;
  fileSizeBytes: number;
}
```

> **Note:** The SQL schema supports `"hausa"` in its CHECK constraint, but the TypeScript `Language` type omits it. If Hausa content is needed, add it to the union.

---

## 6. Supabase Setup

### 6.1 Database Schema

```sql
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

create table scholars (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  bio           text,
  photo_url     text,
  languages     text[] default '{}',
  social_links  jsonb default '{}',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index scholars_slug_idx on scholars(slug);
create index scholars_active_idx on scholars(is_active);

create table series (
  id            uuid primary key default gen_random_uuid(),
  scholar_id    uuid not null references scholars(id) on delete cascade,
  title         text not null,
  slug          text not null unique,
  description   text,
  cover_url     text,
  is_featured   boolean not null default false,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index series_slug_idx on series(slug);
create index series_scholar_idx on series(scholar_id);

create table episodes (
  id               uuid primary key default gen_random_uuid(),
  series_id        uuid references series(id) on delete set null,
  scholar_id       uuid not null references scholars(id) on delete cascade,
  title            text not null,
  slug             text not null unique,
  description      text,
  audio_url        text not null,
  duration_seconds integer,
  language         text not null default 'yoruba' check (language in ('yoruba', 'english', 'hausa', 'arabic')),
  tags             text[] not null default '{}',
  recorded_date    date,
  play_count       integer not null default 0,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index episodes_slug_idx on episodes(slug);
create index episodes_scholar_idx on episodes(scholar_id);
create index episodes_series_idx on episodes(series_id);

create or replace function immutable_array_to_string(text[], text)
returns text as $$
  select array_to_string($1, $2);
$$ language sql immutable;

create index episodes_fts_idx on episodes using gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || immutable_array_to_string(tags, ' '))
);
create index episodes_title_trgm_idx on episodes using gin(title gin_trgm_ops);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger scholars_updated_at before update on scholars for each row execute function update_updated_at();
create trigger series_updated_at before update on series for each row execute function update_updated_at();
create trigger episodes_updated_at before update on episodes for each row execute function update_updated_at();

create table admins (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        text not null check (role in ('super_admin', 'scholar_admin')),
  scholar_id  uuid references scholars(id) on delete cascade,
  is_active   boolean not null default true,
  invited_by  uuid references admins(id),
  created_at  timestamptz not null default now(),
  constraint scholar_admin_has_scholar check (
    (role = 'scholar_admin' and scholar_id is not null) or (role = 'super_admin' and scholar_id is null)
  )
);

create or replace function is_super_admin()
returns boolean as $$
  select exists (select 1 from admins where id = auth.uid() and role = 'super_admin' and is_active = true);
$$ language sql security definer stable;

create or replace function my_scholar_id()
returns uuid as $$
  select scholar_id from admins where id = auth.uid() and role = 'scholar_admin' and is_active = true;
$$ language sql security definer stable;

-- Data API grants (required since Supabase May 2026 — tables not auto-exposed)
grant usage on schema public to anon, authenticated;
grant select on scholars, series, episodes to anon, authenticated;
grant insert, update, delete on scholars, series, episodes to authenticated;
grant select, insert, update, delete on admins to authenticated;
grant all on all tables in schema public to service_role;

alter table scholars enable row level security;
alter table series   enable row level security;
alter table episodes enable row level security;
alter table admins   enable row level security;

-- Public read — no TO clause so it applies to anon + authenticated
create policy "public_read_scholars" on scholars for select using (is_active = true);
create policy "public_read_series" on series for select using (is_active = true);
create policy "public_read_episodes" on episodes for select using (is_published = true);

-- Super admin — full access, restricted to authenticated
create policy "super_admin_all_scholars" on scholars for all to authenticated using (is_super_admin());
create policy "super_admin_all_series"   on series   for all to authenticated using (is_super_admin());
create policy "super_admin_all_episodes" on episodes for all to authenticated using (is_super_admin());
create policy "super_admin_all_admins"   on admins   for all to authenticated using (is_super_admin());

-- Scholar admin — scoped to own scholar, restricted to authenticated
create policy "scholar_admin_own_series" on series for all to authenticated using (scholar_id = my_scholar_id()) with check (scholar_id = my_scholar_id());
create policy "scholar_admin_own_episodes" on episodes for all to authenticated using (scholar_id = my_scholar_id()) with check (scholar_id = my_scholar_id());
create policy "scholar_admin_self" on admins for select to authenticated using (id = (select auth.uid()));
```

---

## 7. Core Library Files

### `lib/utils.ts`

```typescript
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}
```

### `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

### `lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    },
  );
};
```

### `lib/supabase/admin.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "../utils";

export const createAdminClient = () =>
  createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
```

### `lib/auth.ts`

```typescript
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "scholar_admin";

export interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  scholarId: string | null;
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    if (userError) console.error("getCurrentAdmin: auth error", userError);
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id, name, email, role, scholar_id, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (adminError || !admin) {
    if (adminError && adminError.code !== "PGRST116") {
      console.error("getCurrentAdmin: admin query error", adminError);
    }
    return null;
  }
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    scholarId: admin.scholar_id,
  };
}

export async function requireAdmin(
  requiredRole?: AdminRole,
): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (requiredRole && admin.role !== requiredRole) redirect("/admin");
  return admin;
}
```

### `lib/r2.ts`

```typescript
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "./utils";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${requireEnv("CLOUDFLARE_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});

const publicUrl = requireEnv("NEXT_PUBLIC_R2_PUBLIC_URL");
const bucketName = requireEnv("R2_BUCKET_NAME");

export async function uploadAudio(
  buffer: Buffer,
  key: string,
  contentType = "audio/mpeg",
): Promise<string> {
  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: { "accept-ranges": "bytes" },
      }),
    );
    return `${publicUrl}/${encodeURIComponent(key)}`;
  } catch (error) {
    throw new Error(
      `R2 upload failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
```

### `lib/audio.ts`

```typescript
export function formatDuration(seconds: number): string {
  if (seconds < 0 || !Number.isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${m}:${ss}`;
}

export function parseDurationString(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  if (parts.some((p) => p === "")) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  if (nums.length === 1) return nums[0];
  return null;
}

// TODO: Implement with music-metadata or ffprobe once upload flow is built
export async function getAudioDuration(
  _buffer: Buffer,
): Promise<number | null> {
  return null;
}
```

### `components/ui/cn.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 8. Player Store (Zustand)

### `store/player.ts`

```typescript
import { create } from "zustand";
import type { Episode, Speed } from "@/types";

interface PlayerStore {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: Speed;
  isLoading: boolean;
  sleepTimerRemaining: number | null;
  setEpisode: (episode: Episode) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setSpeed: (speed: Speed) => void;
  setLoading: (loading: boolean) => void;
  setSleepTimer: (seconds: number | null) => void;
  tickSleepTimer: () => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  isLoading: false,
  sleepTimerRemaining: null,
  setEpisode: (episode) =>
    set({
      currentEpisode: episode,
      currentTime: 0,
      duration: episode.duration_seconds ?? 0,
      isPlaying: true,
    }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setSpeed: (speed) => set({ speed }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSleepTimer: (seconds) => set({ sleepTimerRemaining: seconds }),
  tickSleepTimer: () => {
    const current = get().sleepTimerRemaining;
    if (current === null) return;
    if (current <= 1) {
      set({ sleepTimerRemaining: null, isPlaying: false });
    } else {
      set({ sleepTimerRemaining: current - 1 });
    }
  },
  clear: () =>
    set({
      currentEpisode: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      speed: 1,
      isLoading: false,
      sleepTimerRemaining: null,
    }),
}));
```

---

## 9. Proxy (formerly Middleware)

> **Note:** Next.js 16 renamed `middleware.ts` → `proxy.ts` and `middleware()` → `proxy()`. Runtime now defaults to Node.js, giving full access to `@supabase/ssr` and Node APIs. See [Next.js Proxy docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

### `proxy.ts` (project root)

```typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  if (
    !request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

---

## 10. Execution Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Biome check (lint + format) |
| `pnpm format` | Biome format --write |
| `pnpm exec tsc --noEmit` | Type-check only |
