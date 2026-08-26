import { toast } from "sonner";
import {
  removeDownload as removeStoredDownload,
  saveDownload,
} from "@/lib/downloads-db";
import { invalidateDownloads } from "@/lib/query-client";
import { useDownloadsStore } from "@/store/downloads";
import type { Episode } from "@/types";

export interface DownloadProgress {
  episodeId: string;
  loaded: number;
  total: number;
  percent: number;
}

async function checkStorageQuota(): Promise<{
  available: number;
  used: number;
  quota: number;
}> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      available: estimate.quota ? estimate.quota - (estimate.usage ?? 0) : 0,
      used: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
    };
  }
  return { available: 50 * 1024 * 1024, used: 0, quota: 50 * 1024 * 1024 };
}

async function requestPersistentStorage(): Promise<void> {
  try {
    if ("storage" in navigator && "persist" in navigator.storage) {
      await navigator.storage.persist();
    }
  } catch (error) {
    console.warn("Persistent storage request failed:", error);
  }
}

async function primeOfflinePageCache(slug: string): Promise<boolean> {
  if (!("caches" in window)) return false;

  try {
    const cache = await caches.open("manhaj-pages");
    const paths = [`/offline/${slug}`, `/lectures/${slug}`];

    let cached = false;
    for (const path of paths) {
      const response = await fetch(path, { credentials: "same-origin" });
      if (response.ok) {
        await cache.put(path, response.clone());
        cached = true;
      }
    }
    return cached;
  } catch (error) {
    console.warn("Failed to prime offline page cache:", error);
    return false;
  }
}

interface TransferControl {
  controller: AbortController;
  paused: boolean;
  waiters: Array<() => void>;
}

const activeTransfers = new Map<string, TransferControl>();
const MAX_ATTEMPTS = 3;

function wait(ms: number, signal: AbortSignal) {
  if (signal.aborted) {
    return Promise.reject(new DOMException("Download cancelled", "AbortError"));
  }
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Download cancelled", "AbortError"));
      },
      { once: true },
    );
  });
}

export function isTransientDownloadError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError")
    return false;
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return false;
  return /network|fetch|terminated|socket|timeout|http 429|http 5\d\d/i.test(
    error.message,
  );
}

export function pauseDownload(episodeId: string): void {
  const transfer = activeTransfers.get(episodeId);
  if (transfer && !transfer.controller.signal.aborted) {
    transfer.paused = true;
    useDownloadsStore
      .getState()
      .updateProgress(episodeId, { status: "paused" });
  }
}

export function resumeDownload(episodeId: string): void {
  const transfer = activeTransfers.get(episodeId);
  if (!transfer) return;
  transfer.paused = false;
  const waiters = transfer.waiters.splice(0);
  for (const resolve of waiters) resolve();
}

export function cancelDownload(episodeId: string): void {
  const transfer = activeTransfers.get(episodeId);
  if (!transfer) return;
  transfer.controller.abort();
  const waiters = transfer.waiters.splice(0);
  for (const resolve of waiters) resolve();
}

export async function evictDownload(
  episodeId: string,
  slug: string,
  audioUrl?: string | null,
): Promise<void> {
  const { removeDownload, removePlaybackHistory } = await import(
    "@/lib/downloads-db"
  );
  await removeDownload(episodeId);
  await removePlaybackHistory(episodeId);
  if (!("caches" in window)) return;
  const paths = [`/offline/${slug}`, `/lectures/${slug}`];
  if (audioUrl) {
    paths.push(`/api/download?url=${encodeURIComponent(audioUrl)}`, audioUrl);
  }
  await Promise.all(
    paths.map(async (path) => {
      for (const cacheName of ["manhaj-pages", "manhaj-api", "manhaj-audio"]) {
        const cache = await caches.open(cacheName);
        await cache.delete(path);
      }
    }),
  );
}

export async function downloadEpisode(
  episode: Episode,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<boolean> {
  if (!episode.audio_url) {
    toast.error(`No audio available for "${episode.title}"`);
    return false;
  }

  const existing = activeTransfers.get(episode.id);
  if (existing) return false;

  const controller = new AbortController();
  const transfer: TransferControl = {
    controller,
    paused: false,
    waiters: [],
  };
  activeTransfers.set(episode.id, transfer);
  const store = useDownloadsStore.getState();
  store.resetDownload(episode);

  try {
    const storage = await checkStorageQuota();
    if (storage.available < 5 * 1024 * 1024) {
      const msg = `Not enough storage. Free up ${Math.ceil((5 * 1024 * 1024 - storage.available) / 1024 / 1024)}MB.`;
      store.updateProgress(episode.id, {
        status: "error",
        error: msg,
      });
      toast.error(msg);
      return false;
    }

    let chunks: BlobPart[] = [];
    let loaded = 0;
    let total = 0;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const range = loaded > 0 ? `bytes=${loaded}-` : undefined;
        const response = await fetch(
          `/api/download?url=${encodeURIComponent(episode.audio_url)}`,
          {
            headers: range ? { Range: range } : undefined,
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        if (!response.body) throw new Error("Stream unavailable");

        const contentRange = response.headers.get("content-range");
        const rangeTotal = contentRange?.match(/\/([0-9]+)$/)?.[1];
        if (rangeTotal) {
          total = Number.parseInt(rangeTotal, 10);
        } else if (loaded === 0) {
          const contentLength = response.headers.get("content-length");
          total = contentLength ? Number.parseInt(contentLength, 10) : 0;
        }
        if (loaded > 0 && response.status !== 206) {
          chunks = [];
          loaded = 0;
          const contentLength = response.headers.get("content-length");
          total = contentLength ? Number.parseInt(contentLength, 10) : 0;
        }
        if (total > 0 && total > storage.available) {
          throw new Error(
            `File too large (${(total / 1024 / 1024).toFixed(1)}MB). Free up space.`,
          );
        }

        const reader = response.body.getReader();
        while (true) {
          if (transfer.paused) {
            store.updateProgress(episode.id, { status: "paused" });
            await new Promise<void>((resolve) =>
              transfer.waiters.push(resolve),
            );
            controller.signal.throwIfAborted();
            store.updateProgress(episode.id, { status: "downloading" });
          }

          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
          store.updateProgress(episode.id, {
            loaded,
            total,
            percent,
            status: "downloading",
          });
          onProgress?.({ episodeId: episode.id, loaded, total, percent });
        }
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        if (
          controller.signal.aborted ||
          attempt === MAX_ATTEMPTS ||
          !isTransientDownloadError(error)
        ) {
          throw error;
        }
        await wait(500 * 2 ** (attempt - 1), controller.signal);
      }
    }

    if (lastError) throw lastError;

    store.updateProgress(episode.id, { status: "saving" });
    controller.signal.throwIfAborted();
    const blob = new Blob(chunks, { type: "audio/mpeg" });
    await saveDownload(episode, blob);
    controller.signal.throwIfAborted();
    await requestPersistentStorage();
    const primed = await primeOfflinePageCache(episode.slug);

    store.updateProgress(episode.id, { status: "completed", percent: 100 });
    if (primed) {
      toast.success(`Downloaded "${episode.title}"`);
    } else {
      toast.warning(
        `Downloaded "${episode.title}" — offline page may not load. Check your connection.`,
      );
    }
    invalidateDownloads();
    store.removeDownload(episode.id);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      await removeStoredDownload(episode.id).catch(() => undefined);
      invalidateDownloads();
      store.removeDownload(episode.id);
      toast.info(`Cancelled "${episode.title}"`);
      return false;
    }
    const msg = error instanceof Error ? error.message : String(error);
    store.updateProgress(episode.id, { status: "error", error: msg });

    const lower = msg.toLowerCase();
    if (lower.includes("network") || lower.includes("fetch")) {
      toast.error("Network error — check your connection");
    } else if (lower.includes("403") || lower.includes("401")) {
      toast.error("Access denied — contact support");
    } else if (lower.includes("timeout") || lower.includes("aborted")) {
      toast.error("Download timed out — try again");
    } else if (lower.includes("indexeddb")) {
      toast.error(
        "Couldn't save the file to local storage. Storage may be full or unavailable.",
      );
    } else {
      toast.error(`Couldn't download "${episode.title}". ${msg.slice(0, 60)}`);
    }
    return false;
  } finally {
    if (activeTransfers.get(episode.id) === transfer) {
      activeTransfers.delete(episode.id);
    }
  }
}

export async function downloadEpisodeSequence(
  episodes: Episode[],
  onProgress?: (progress: {
    episodeIndex: number;
    episodeName: string;
    success: boolean;
  }) => void,
): Promise<number> {
  let successCount = 0;

  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i];
    const success = await downloadEpisode(episode);
    if (onProgress) {
      onProgress({
        episodeIndex: i,
        episodeName: episode.title,
        success,
      });
    }
    if (success) successCount++;
    if (i < episodes.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return successCount;
}
