# Manhaj — Library Setup Guide (v1.5)
**Scope:** UI/UX libraries only — what to install, how to set each one up, and when to reach for it.
**Companion to:** `manhaj-brd-v1.1.md` (requirements), `Design.md` (screens/tokens), `manhaj-setup-v1.2.md` (full stack — schema, env, proxy, etc.)
**Decision on record:** No shadcn (see design discussion) — bare Radix primitives + the existing Tailwind v4 token system, kept consistent across public and admin.

---

## 1. Full Dependency List

### Already installed (from v1.2 — unchanged)

| Package | Used for |
|---|---|
| `howler` | Audio playback engine — §4.4/4.5 player + mini-player |
| `zustand` | Player store (`store/player.ts`) |
| `@serwist/next`, `serwist` | PWA shell + offline audio caching |
| `@supabase/ssr`, `@supabase/supabase-js` | Auth + DB client |
| `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | R2 upload (admin, §4.10) |
| `slugify` | URL slugs for scholars/series/episodes |
| `clsx`, `tailwind-merge` | className composition (`cn()` utility) |

### New — add these for the UI in Design.md

| Package | Used for | Surface |
|---|---|---|
| `lucide-react` | All nav/action icons | Public + Admin |
| `@radix-ui/react-select` | Series/language selects, account menu | Admin (§4.10), Public header |
| `@radix-ui/react-dropdown-menu` | Account menu (`Abu A. ▾`) | Admin |
| `@radix-ui/react-tabs` | Series / All Episodes tabs | Public (§4.2) |
| `@radix-ui/react-dialog` | Delete-confirmation, any modal | Admin |
| `vaul` | Floating-nav "Menu" sheet, mini-player → full-player expand | Public (§4.5), Admin (mobile) |
| `react-hook-form` | Form state for New Episode / New Series / Scholar edit | Admin (§4.10) |
| `zod` | Schema validation, mirrors `types/index.ts` | Admin |
| `idb` | Stores downloaded-episode metadata (size, date) | Public (§4.7 Downloads) |
| `sonner` | Toast feedback (save/publish/error) | Admin primarily, Public for download-started/offline notices |

### Deliberately not installed

| Skipped | Why |
|---|---|
| `shadcn` / `class-variance-authority` | Generic default theme fights the maktabah identity; bare Radix gives the same accessibility without the generated component bloat |
| `framer-motion` | CSS transitions cover everything needed; avoids extra JS on low-end Android |
| Any chart library | No admin analytics in MVP (BRD §5 out of scope) |
| `use-debounce` | Search debounce (§4.6) is a 5-line hook, not worth a dependency |

---

## 2. Install

```bash
pnpm add lucide-react @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-dialog vaul react-hook-form zod idb sonner
```

No dev-dependency additions needed — all of the above ship their own types.

---

## 3. Setup & When to Use

### 3.1 `lucide-react` — Icons

**Setup:** nothing beyond install. Tree-shakeable — each icon is its own import, so only the icons actually used ship to the client.

```tsx
import { Home, Library, Search, Download, Play, Pause } from "lucide-react";

<Home size={22} className="text-forest-600" strokeWidth={2} />
```

**When to use:** every icon in Design.md — bottom nav (§3.2), play/pause/download/share controls, sleep timer, admin sidebar items. Standard size: `22px` in nav, `18px` inline with text, `28px+` for the large player play button (§4.4). Always paired with an `aria-label` on the parent button per §6 — icons alone are never the only label.

---

### 3.2 Radix Primitives — Accessible UI building blocks

Four packages, same pattern: unstyled behavior + accessibility (focus trap, keyboard nav, ARIA roles), styled entirely with Tailwind classes against the existing token system. No theme file to reconcile, unlike shadcn.

#### `@radix-ui/react-select`
**When to use:** Series dropdown and Language dropdown on the New Episode form (§4.10).

```tsx
import * as Select from "@radix-ui/react-select";

<Select.Root>
  <Select.Trigger className="flex h-11 items-center justify-between rounded-lg border border-sand-200 bg-sand-50 px-3 text-forest-900">
    <Select.Value placeholder="Select series" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content className="rounded-lg border border-sand-200 bg-sand-50 shadow-md">
      <Select.Viewport>
        <Select.Item value="series-a" className="px-3 py-2 text-sm data-[highlighted]:bg-forest-50 outline-none">
          <Select.ItemText>Series A</Select.ItemText>
        </Select.Item>
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

#### `@radix-ui/react-dropdown-menu`
**When to use:** the `Abu A. ▾` account menu in the admin header (§3.3) — sign out, account info.

```tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

<DropdownMenu.Root>
  <DropdownMenu.Trigger className="text-sm font-medium text-forest-700">
    Abu A. ▾
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content className="rounded-lg border border-sand-200 bg-sand-50 p-1 shadow-md" align="end">
      <DropdownMenu.Item className="rounded px-3 py-2 text-sm data-[highlighted]:bg-forest-50 outline-none cursor-pointer">
        Sign out
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

#### `@radix-ui/react-tabs`
**When to use:** "Series / All Episodes" tabs on the Scholar Profile page (§4.2).

```tsx
import * as Tabs from "@radix-ui/react-tabs";

<Tabs.Root defaultValue="series">
  <Tabs.List className="flex border-b border-sand-200">
    <Tabs.Trigger value="series" className="px-4 py-2 text-sm font-medium data-[state=active]:text-forest-600 data-[state=active]:border-b-2 data-[state=active]:border-forest-500">
      Series
    </Tabs.Trigger>
    <Tabs.Trigger value="episodes" className="px-4 py-2 text-sm font-medium data-[state=active]:text-forest-600 data-[state=active]:border-b-2 data-[state=active]:border-forest-500">
      All Episodes
    </Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="series">{/* 2-col series grid */}</Tabs.Content>
  <Tabs.Content value="episodes">{/* episode row list */}</Tabs.Content>
</Tabs.Root>
```

#### `@radix-ui/react-dialog`
**When to use:** any confirmation modal in admin — e.g. deleting an episode/series. Not used on the public app (no destructive listener actions exist in MVP).

```tsx
import * as Dialog from "@radix-ui/react-dialog";

<Dialog.Root>
  <Dialog.Trigger asChild><button>Delete</button></Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-forest-900/40" />
    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-sand-50 p-6 w-[90vw] max-w-sm">
      <Dialog.Title className="font-semibold text-forest-900">Delete this episode?</Dialog.Title>
      <Dialog.Description className="text-sm text-forest-700 mt-1">
        This removes it from the public library immediately. This can't be undone.
      </Dialog.Description>
      {/* Cancel / Delete buttons */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

### 3.3 `vaul` — Mobile sheets

**Setup:** install only — works directly with the existing Tailwind setup.

**When to use:** two specific spots from Design.md §3.3 and §4.5:
1. The admin mobile floating nav's **Menu** item — surfaces Scholars / Admins / Sign out as a bottom sheet for scholar admins who don't get permanent tabs for super-admin-only sections.
2. Expanding the **mini-player into the full player** (§4.5) on mobile — drag-up gesture from the persistent mini-player bar into the full `/lectures/[slug]`-style player view.

```tsx
import { Drawer } from "vaul";

<Drawer.Root>
  <Drawer.Trigger>Menu</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 bg-forest-900/40" />
    <Drawer.Content className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-sand-50 p-4">
      <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-sand-300" />
      {/* Scholars / Admins / Sign out list */}
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

Do not use vaul for desktop — it's a mobile-gesture primitive; desktop admin uses the sidebar (§3.3) and Radix Dialog for modals instead.

---

### 3.4 `react-hook-form` + `zod` — Admin forms

**Setup:** define one zod schema per form, mirrored from `types/index.ts`, then wire it through `@hookform/resolvers/zod` — but to avoid one more dependency, validate manually with `schema.safeParse()` in `onSubmit` instead of using the resolver package.

```tsx
import { useForm } from "react-hook-form";
import { z } from "zod";

const episodeSchema = z.object({
  title: z.string().min(3, "Title is required"),
  seriesId: z.string().min(1, "Select a series"),
  language: z.enum(["yoruba", "english", "hausa", "arabic"]),
  tags: z.array(z.string()).default([]),
  audioFile: z.instanceof(File, { message: "Audio file is required" }),
  recordedDate: z.string().optional(),
  description: z.string().optional(),
});

type EpisodeForm = z.infer<typeof episodeSchema>;

const { register, handleSubmit, formState: { errors } } = useForm<EpisodeForm>();

function onSubmit(data: EpisodeForm) {
  const result = episodeSchema.safeParse(data);
  if (!result.success) return; // surface result.error to fields
  // proceed to R2 upload + insert
}
```

**When to use:** New Episode, New Series, and Scholar edit forms (§4.10) — anywhere an admin submits structured data that needs validation before hitting Supabase. Not used on the public side — there are no listener-facing forms in MVP beyond Search, which doesn't need form-level validation.

---

### 3.5 `idb` — Downloaded-episode metadata

**Setup:** create one shared module so the Downloads page, the download button, and the storage-used counter all read/write the same store.

```typescript
// lib/downloads-db.ts
import { openDB, type DBSchema } from "idb";
import type { Episode } from "@/types";

interface ManhajDB extends DBSchema {
  downloads: {
    key: string; // episode id
    value: { episode: Episode; downloadedAt: string; fileSizeBytes: number };
  };
}

const dbPromise = openDB<ManhajDB>("manhaj", 1, {
  upgrade(db) {
    db.createObjectStore("downloads");
  },
});

export async function saveDownload(episode: Episode, fileSizeBytes: number) {
  const db = await dbPromise;
  await db.put("downloads", { episode, downloadedAt: new Date().toISOString(), fileSizeBytes }, episode.id);
}

export async function listDownloads() {
  const db = await dbPromise;
  return db.getAll("downloads");
}

export async function removeDownload(episodeId: string) {
  const db = await dbPromise;
  await db.delete("downloads", episodeId);
}
```

**When to use:** exclusively for `/downloads` (§4.7). The actual audio bytes are cached by the Serwist service worker (already configured in `app/sw.ts`); `idb` only stores the structured record — which episodes, when, how big — that the UI needs to render the list and the "2.1 GB used" counter. Never use this for the audio data itself.

---

### 3.6 `sonner` — Toasts

**Setup:** mount once in the root layout.

```tsx
// app/layout.tsx
import { Toaster } from "sonner";

<body>
  {children}
  <Toaster position="bottom-center" theme="light" />
</body>
```

```tsx
import { toast } from "sonner";

toast.success("Published");
toast.error("Couldn't load this lecture. Check your connection and try again.");
```

**When to use:**
- **Admin:** confirmation after Save draft / Publish (§4.10), and surfacing upload failures.
- **Public:** lightweight, non-blocking confirmations only — e.g. "Download started." Never use a toast for the error states already designed into the page itself (§5's empty/error states are inline, not toasts) — toasts are for transient confirmations, not for content the user needs to act on.

---

## 4. Library-to-Screen Quick Reference

| Design.md screen | New libraries used |
|---|---|
| §3.2/3.3 Nav shell, header | `lucide-react` |
| §4.2 Scholar Profile (tabs) | `@radix-ui/react-tabs`, `lucide-react` |
| §4.5 Mini-player expand | `vaul` |
| §4.7 Downloads | `idb` |
| §4.9 Admin Dashboard (sidebar, account menu) | `lucide-react`, `@radix-ui/react-dropdown-menu` |
| §4.10 New Episode | `react-hook-form`, `zod`, `@radix-ui/react-select`, `sonner` |
| Admin delete confirmations | `@radix-ui/react-dialog` |
| Admin mobile "Menu" sheet | `vaul` |
