# Manhaj — Offline Behavior & PWA Setup

> Complete offline architecture: service worker, IndexedDB, audio playback, routing, and storage management.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User browses online                    │
│         Pages cached by service worker (NetworkFirst)    │
│         Audio cached automatically on first play         │
│         Images cached on first render (CacheFirst)       │
├─────────────────────────────────────────────────────────┤
│                    Connection drops                       │
│         OfflineDetector shows amber banner               │
│         Non-cached pages redirect to /downloads          │
│         /lectures/[slug] → /offline/[slug]               │
│         /offline.html serves as SW fallback              │
├─────────────────────────────────────────────────────────┤
│                    User downloads lectures                │
│         Audio blob stored in IndexedDB (idb)             │
│         Metadata stored alongside blob                   │
│         Persistent storage requested from browser        │
│         Audio plays from blob:// URL (no network needed) │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Service Worker (`app/sw.ts`)

Serwist-based. Runs in production only.

### 2.1 Cache Strategies

| Cache Name | Matcher | Strategy | Max Entries | Max Age |
|---|---|---|---|---|
| `manhaj-pages` | `request.mode === "navigate"` | NetworkFirst | 50 | 7 days |
| `manhaj-audio` | `/\.(mp3\|wav\|ogg\|m4a)$/i` | CacheFirst + RangeRequests | 100 | 30 days |
| `manhaj-images` | `/\.(png\|jpg\|jpeg\|webp\|svg\|gif)$/i` | CacheFirst | 200 | 7 days |
| `manhaj-api` | `/api/*` | NetworkFirst | 50 | 1 hour |
| `sw-precache-manifest` | Next.js precache | Precache | — | — |

### 2.2 Configuration

```typescript
// app/sw.ts
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [
      {
        url: "/downloads",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
  runtimeCaching: [/* ... see §2.1 */],
});

serwist.addEventListeners();
```

Key decisions:
- **`skipWaiting: true`** — new SW activates immediately, no "reload to update" prompt.
- **`clientsClaim: true`** — SW takes over all open tabs instantly.
- **`navigationPreload: true`** — parallel fetch while SW installs, faster first-load.
- **Fallback to `/downloads`** — any uncached navigation while offline shows the downloads page (where offline content lives).

### 2.3 Next.js Integration (`next.config.ts`)

```typescript
// next.config.ts
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: false,
  cacheOnNavigation: true,       // auto-cache navigations
  reloadOnOnline: false,         // don't force-reload when back online
  additionalPrecacheEntries: [
    { url: "/downloads", revision: "v1" },  // always precache downloads page
  ],
});
```

### 2.4 Service Worker Registration (`components/layout/sw-register.tsx`)

```typescript
"use client";
import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => { reg.update(); })
        .catch(() => {});
    }
  }, []);
  return null;
}
```

- Registration only in production.
- `reg.update()` forces check for new SW version on every page load.
- Errors swallowed silently — SW failure should never break the app.

---

## 3. PWA Manifest (`public/manifest.json`)

```json
{
  "name": "Manhaj — Ilm, organized.",
  "short_name": "Manhaj",
  "description": "Audio lectures from trusted Nigerian Sunni/Salafi scholars.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#fafaf7",
  "theme_color": "#1a6b3c",
  "categories": ["education", "podcasts"],
  "prefer_related_applications": false,
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- `standalone` — launches like a native app (no browser chrome).
- `portrait-primary` — locks orientation for consistent layout on phones.
- Maskable icon for Android adaptive icons.

---

## 4. Offline Detection (`components/layout/offline-detector.tsx`)

### 4.1 Routing Behavior

| Current Path | Offline Action |
|---|---|
| `/downloads` | Stay (this is the offline home) |
| `/offline/*` | Stay |
| `/lectures/[slug]` | Redirect to `/offline/[slug]` |
| Any other route | Redirect to `/downloads` |

```typescript
// components/layout/offline-detector.tsx
export function OfflineDetector() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);
  }, []);

  useEffect(() => {
    if (!mounted || !offline) return;

    // Already offline-safe? Stay.
    if (pathname.startsWith("/offline/") || pathname === "/downloads") return;

    // Lecture pages get offline variant
    if (pathname.startsWith("/lectures/")) {
      router.replace(pathname.replace("/lectures/", "/offline/"));
    } else {
      // Everything else → downloads
      router.replace("/downloads");
    }
  }, [mounted, offline, pathname, router]);

  // Online handler clears offline state (no auto-redirect back)
  // ...

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-forest-900 text-sm px-4 py-2 text-center font-medium" role="alert">
      You're offline — showing downloaded content
    </div>
  );
}
```

### 4.2 Offline Fallback Page (`public/offline.html`)

Static HTML — no React, no JS. Served by the service worker when no cached page exists.

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Offline — Manhaj</title>
    <!-- inline styles, no external deps -->
  </head>
  <body>
    <div class="container">
      <div class="icon">📡</div>
      <h1>You're Offline</h1>
      <p>You can still listen to lectures you've already downloaded.</p>
      <a href="/downloads">Go to Downloads</a>
      <div class="hint">
        <strong>Tip:</strong> Pre-download your favorite lectures when online.
      </div>
    </div>
  </body>
</html>
```

---

## 5. IndexedDB Storage (`lib/downloads-db.ts`)

### 5.1 Schema

```typescript
interface ManhajDB extends DBSchema {
  downloads: {
    key: string;                    // episode.id
    value: {
      episode: Episode;             // full episode metadata
      audioBlob: Blob;              // the audio file binary
      downloadedAt: string;         // ISO timestamp
      fileSizeBytes: number;        // blob.size
    };
    indexes: { "by-date": string }; // sort by download date
  };
}
```

- **Database name:** `manhaj`
- **Version:** `2`
- **Open timeout:** 8 seconds (prevents hanging on blocked DB)

### 5.2 Operations

| Function | Purpose |
|---|---|
| `saveDownload(episode, blob)` | Store episode + audio blob in IDB |
| `listDownloads()` | Return all downloads (array) |
| `removeDownload(episodeId)` | Delete single episode by ID |
| `getDownloadBySlug(slug)` | Lookup by slug (for offline lecture page) |
| `getTotalDownloadSize()` | Sum of all `fileSizeBytes` (for storage display) |

### 5.3 Key Implementation Details

```typescript
// lib/downloads-db.ts

const DB_NAME = "manhaj";
const DB_VERSION = 2;
const OPEN_TIMEOUT_MS = 8_000;

let dbPromise: ReturnType<typeof openDB<ManhajDB>> | null = null;

async function getDb(): Promise<IDBPDatabase<ManhajDB>> {
  if (dbPromise) return dbPromise;

  // Timeout guard — IndexedDB can hang on "blocked" event
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("IndexedDB open timed out after 8s")), OPEN_TIMEOUT_MS),
  );

  dbPromise = Promise.race([
    openDB<ManhajDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore("downloads", { keyPath: "episode.id" });
          store.createIndex("by-date", "downloadedAt");
        }
        if (oldVersion === 1) {
          // v2: recreate store (breaking schema change from v1)
          try { db.deleteObjectStore("downloads"); } catch {}
          const store = db.createObjectStore("downloads", { keyPath: "episode.id" });
          store.createIndex("by-date", "downloadedAt");
        }
      },
      blocked() {
        console.warn("IndexedDB upgrade blocked — another tab may be open");
      },
    }),
    timeout,
  ]).catch((err) => {
    console.error("IndexedDB open failed:", err);
    dbPromise = null;
    throw err;
  });

  return dbPromise;
}
```

---

## 6. Download System

### 6.1 Download Entry Point (`lib/download.ts`)

```typescript
export async function downloadEpisode(
  episode: Episode,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<boolean>
```

Flow:
1. Check episode has `audio_url`
2. Add to Zustand `inProgress` list
3. Check storage quota via `navigator.storage.estimate()`
4. Require minimum 5MB free
5. Proxy fetch through `/api/download?url=...` (avoids CORS, validates hostname)
6. Stream response, track progress via `ReadableStream`
7. Build `Blob` from chunks
8. Save to IndexedDB via `saveDownload()`
9. Request persistent storage via `navigator.storage.persist()`
10. Update status to `completed`, remove from `inProgress`

### 6.2 Download API Proxy (`app/api/download/route.ts`)

```typescript
// Validates target hostname against allowlist
// Proxies fetch with Range header support
// Returns audio stream with correct Content-Type
// 30s timeout on upstream fetch

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  // ... validate URL, check hostname against ALLOWED_HOSTNAMES
  const upstream = await fetch(rawUrl, {
    headers: rangeHeader ? { Range: rangeHeader } : undefined,
    signal: AbortSignal.timeout(30000),
  });
  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
```

Allowed hostnames: `manhaj.abdurrahman.org` + `NEXT_PUBLIC_R2_PUBLIC_URL` hostname.

### 6.3 Batch Download (`lib/download.ts`)

```typescript
export async function downloadEpisodeSequence(
  episodes: Episode[],
  onProgress?: (progress: { episodeIndex: number; episodeName: string; success: boolean }) => void,
): Promise<number>  // returns success count
```

- Sequential (not parallel) — prevents saturating slow connections
- 500ms delay between downloads — gives browser time to flush IDB writes
- Used by "Download all" button on series pages

### 6.4 Storage Quota Check

```typescript
async function checkStorageQuota() {
  const estimate = await navigator.storage.estimate();
  return {
    available: estimate.quota ? estimate.quota - (estimate.usage ?? 0) : 0,
    used: estimate.usage ?? 0,
    quota: estimate.quota ?? 0,
  };
}
```

- Minimum 5MB free required before download starts
- File size checked against available space before streaming
- Fallback: 50MB assumed if Storage API unavailable

---

## 7. Audio Playback — Online vs Offline

### 7.1 Source Resolution (`components/layout/audio-provider.tsx`)

```typescript
const resolveSrc = async () => {
  // 1. Try to find local download in IDB
  let downloads = await listDownloads();
  const local = downloads.find((d) => d.episode.id === currentEpisode.id);

  // 2. Clean up previous blob URL
  if (objectUrlRef.current) {
    URL.revokeObjectURL(objectUrlRef.current);
  }

  // 3. Use local blob if available, else stream from network
  if (local?.audioBlob) {
    const url = URL.createObjectURL(local.audioBlob);
    objectUrlRef.current = url;
    audio.src = url;
  } else {
    audio.src = currentEpisode.audio_url;
  }

  audio.load();
};
```

**Priority:** Local blob > Network URL. No user intervention needed — the player automatically picks the local copy if it exists.

### 7.2 Blob URL Lifecycle

```
Episode selected
  → IDB lookup
  → Found? → URL.createObjectURL(blob) → audio.src = blob://...
  → Not found? → audio.src = https://...r2.dev/episode.mp3

Episode changes or cleared
  → URL.revokeObjectURL(previous) → prevent memory leak
```

### 7.3 Offline Playback States

| Scenario | Behavior |
|---|---|
| Episode downloaded, online | Plays from IDB blob (no network) |
| Episode downloaded, offline | Plays from IDB blob (works) |
| Episode not downloaded, online | Streams from R2 via network |
| Episode not downloaded, offline | Shows "not downloaded" message |

---

## 8. Offline Lecture Page (`app/(public)/lectures/[slug]/offline-lecture.tsx`)

When `OfflineDetector` redirects `/lectures/abc` → `/offline/abc`, the server component at `page.tsx` checks for `?mode=offline` and renders `OfflineLecture`:

```typescript
// app/(public)/lectures/[slug]/page.tsx
export default async function LecturePage({ params, searchParams }) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const episode = await getEpisodeBySlug(slug);

  if (!episode) {
    if (mode === "offline") {
      return <OfflineLecture slug={slug} />;
    }
    notFound();
  }
  // ...
}
```

```typescript
// offline-lecture.tsx
export function OfflineLecture({ slug }: { slug: string }) {
  const [episode, setEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    getDownloadBySlug(slug).then((entry) => {
      if (entry) setEpisode(entry.episode);
    });
  }, [slug]);

  if (!episode) {
    return (
      <div>
        <p>You're offline and this lecture isn't downloaded yet.</p>
        <p>Connect to play, or download lectures in advance from the Downloads tab.</p>
      </div>
    );
  }

  return <LectureContent episode={episode} moreEpisodes={[]} />;
}
```

Note: `moreEpisodes` is empty when offline (no network to fetch series list).

---

## 9. Downloads Page (`app/(public)/downloads/`)

The offline home. Shows all downloaded lectures with storage usage.

```typescript
// downloads-content.tsx
export function DownloadsContent() {
  // State
  const [downloads, setDownloads] = useState<DownloadedEpisode[]>([]);
  const inProgress = useDownloadsStore((s) => s.inProgress);
  const downloadRevision = useDownloadsStore((s) => s.downloadRevision);

  // Storage display
  const totalBytes = downloads.reduce((sum, d) => sum + (d.fileSizeBytes ?? 0), 0);

  return (
    <>
      <Header />
      {/* Storage usage: "2.1 GB used" */}
      {/* In-progress downloads: progress bars */}
      {/* Downloaded episodes: AudioCard list with play/delete */}
      {/* Empty state: "Nothing downloaded yet" */}
      {/* Error state: "Couldn't load downloads. Tap to retry." */}
    </>
  );
}
```

### 9.1 DownloadedEpisode Type

```typescript
interface DownloadedEpisode {
  episode: Episode;
  audioBlob: Blob;
  downloadedAt: string;      // ISO timestamp
  fileSizeBytes: number;
}
```

---

## 10. State Management

### 10.1 Downloads Store (`store/downloads.ts`)

```typescript
interface DownloadsStore {
  inProgress: DownloadProgress[];
  downloadRevision: number;       // bumped on completion, triggers re-fetch
  addDownload: (episode) => void;
  updateProgress: (episodeId, partial) => void;
  removeDownload: (episodeId) => void;
  clearCompleted: () => void;
}
```

`downloadRevision` is the key reactivity trigger — components watching it re-fetch from IDB when downloads complete.

### 10.2 useDownloadedIds Hook (`lib/use-downloaded.ts`)

```typescript
export function useDownloadedIds() {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const downloadRevision = useDownloadsStore((s) => s.downloadRevision);

  useEffect(() => {
    listDownloads().then((items) => {
      setIds(new Set(items.map((d) => d.episode.id)));
    });
  }, [downloadRevision]);

  return ids;
}
```

Used by `LectureContent` to show "Downloaded" badge on the lecture page.

---

## 11. Persistent Storage

```typescript
async function requestPersistentStorage(): Promise<void> {
  if ("storage" in navigator && "persist" in navigator.storage) {
    await navigator.storage.persist();
  }
}
```

Called after every successful download. Requests the browser not to evict IDB data under storage pressure. Critical for low-storage Android devices.

---

## 12. Error Handling

### 12.1 Download Errors

| Error Type | User Message |
|---|---|
| No `audio_url` | `No audio available for "Episode Title"` |
| < 5MB free | `Not enough storage. Free up XMB.` |
| File > available | `File too large (X.XMB). Free up space.` |
| Network/fetch | `Network error — check your connection` |
| 401/403 | `Access denied — contact support` |
| Timeout | `Download timed out — try again` |
| IndexedDB error | `Couldn't save the file to local storage. Storage may be full or unavailable.` |
| Unknown | `Couldn't download "Title". <first 60 chars of error>` |

### 12.2 IDB Errors

- Open timeout (8s) → thrown, caught by caller
- `blocked` event → logged as warning (another tab may have DB open)
- Upgrade failure → `dbPromise` reset to null, next call retries

### 12.3 Audio Playback Errors

```typescript
// audio-provider.tsx
audio.play().catch(() => setPlaying(false));
```

- Play failure → silently pause (user can retry)
- Load error → `setLoading(false)` (UI shows play button, not spinner)

---

## 13. Data Flow Diagrams

### 13.1 Download Flow

```
User taps ⬇ on lecture
  │
  ├─ downloadEpisode(episode)
  │   ├─ checkStorageQuota()
  │   │   └─ navigator.storage.estimate()
  │   ├─ fetch(`/api/download?url=${episode.audio_url}`)
  │   │   └─ API validates hostname, proxies to R2
  │   ├─ stream response → chunks[]
  │   │   └─ updateProgress() → Zustand → UI progress bar
  │   ├─ new Blob(chunks, { type: "audio/mpeg" })
  │   ├─ saveDownload(episode, blob) → IDB
  │   ├─ navigator.storage.persist()
  │   └─ toast.success() + removeDownload() from Zustand
  │
  └─ useDownloadedIds re-fetches (downloadRevision++)
      └─ Lecture page shows "Downloaded" badge
```

### 13.2 Offline Playback Flow

```
User opens /lectures/abc while offline
  │
  ├─ OfflineDetector detects navigator.onLine === false
  │   └─ router.replace("/offline/abc?mode=offline")
  │
  ├─ page.tsx server component
  │   ├─ getEpisodeBySlug("abc") → null (can't reach Supabase)
  │   └─ mode === "offline" → render <OfflineLecture slug="abc" />
  │
  ├─ OfflineLecture client component
  │   └─ getDownloadBySlug("abc") → IDB lookup
  │       ├─ found → render <LectureContent episode={...} />
  │       └─ not found → "not downloaded" message
  │
  └─ User taps play
      └─ AudioProvider.resolveSrc()
          └─ IDB lookup → found → URL.createObjectURL(blob) → audio plays
```

---

## 14. Cache Invalidation

| Trigger | Behavior |
|---|---|
| SW update (`skipWaiting`) | New SW activates, old caches still serve until new precache populates |
| `maxAgeSeconds` expiry | Entry evicted on next access (lazy cleanup) |
| `maxEntries` exceeded | Least-recently-used entry evicted |
| Manual download delete | Only removes from IDB — SW caches untouched |
| Browser "Clear site data" | Wipes everything (SW, caches, IDB) |

---

## 15. Known Limitations

1. **No background sync** — downloads require active connection. If connection drops mid-download, progress is lost (no resume).
2. **No download resume** — large files on slow connections may fail. Currently retries from scratch.
3. **IndexedDB storage limits** — varies by browser/device. Android Chrome: typically 60% of free disk space. `navigator.storage.persist()` helps but isn't guaranteed.
4. **`getDownloadBySlug` is O(n)** — iterates all downloads to find by slug. Acceptable for <100 downloads (the IDB maxEntries limit).
5. **No podcast-style auto-download** — user must manually download each episode.
6. **No sync across devices** — downloads are local to each browser/device.
7. **Offline search** — search requires Supabase (online only). No local index of downloaded content metadata.
8. **Blob URL memory** — each playing downloaded episode holds a blob URL in memory. Cleared when episode changes.

---

## 16. File Map

```
app/
├── sw.ts                              # Service worker (Serwist config)
├── api/download/route.ts              # Audio proxy (CORS bypass + validation)
├── (public)/
│   ├── downloads/
│   │   ├── page.tsx                   # Downloads page (server shell)
│   │   └── downloads-content.tsx      # Downloads UI (client)
│   └── lectures/[slug]/
│       ├── page.tsx                   # Lecture page (handles ?mode=offline)
│       ├── lecture-content.tsx        # Full player UI (client)
│       └── offline-lecture.tsx        # Offline fallback (IDB lookup)
├── offline.html                       # Static offline page (no JS)

components/
├── layout/
│   ├── sw-register.tsx                # Registers SW in production
│   ├── offline-detector.tsx           # Online/offline routing + banner
│   └── audio-provider.tsx             # Audio element + source resolution
├── player/
│   └── player-controls.tsx            # Play/pause/seek/speed/timer
└── episodes/
    ├── download-row.tsx               # Download list item (play + delete)
    └── audio-card.tsx                 # Episode card (used in downloads)

lib/
├── download.ts                        # downloadEpisode(), downloadEpisodeSequence()
├── downloads-db.ts                    # IndexedDB CRUD (idb wrapper)
├── use-downloaded.ts                  # Hook: set of downloaded episode IDs
└── audio.ts                           # formatDuration(), parseDurationString()

store/
├── downloads.ts                       # Zustand: inProgress[], downloadRevision
└── player.ts                          # Zustand: currentEpisode, isPlaying, etc.

public/
├── manifest.json                      # PWA manifest
├── offline.html                       # Static offline fallback
└── icons/                             # PWA icons (192, 512, maskable)

next.config.ts                         # Serwist integration
```

---

## 17. Environment Variables Required

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 bucket public URL (hostname added to download proxy allowlist) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public key |

---

*Companion to: `DESIGN.md` (§4.7 Downloads), `manhaj-brd-v1.1.md` (§5.3 Offline), `manhaj-setup-v1.2.md` (Serwist config).*
