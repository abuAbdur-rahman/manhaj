import { toast } from "sonner";
import { saveDownload } from "@/lib/downloads-db";
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

export async function downloadEpisode(
  episode: Episode,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<boolean> {
  if (!episode.audio_url) {
    toast.error(`No audio available for "${episode.title}"`);
    return false;
  }

  const store = useDownloadsStore.getState();
  store.addDownload(episode);

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

    const response = await fetch(
      `/api/download?url=${encodeURIComponent(episode.audio_url)}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Stream unavailable");
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? Number.parseInt(contentLength, 10) : 0;

    if (total > 0 && total > storage.available) {
      const msg = `File too large (${(total / 1024 / 1024).toFixed(1)}MB). Free up space.`;
      store.updateProgress(episode.id, { status: "error", error: msg });
      toast.error(msg);
      return false;
    }

    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];
    let loaded = 0;

    while (true) {
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
      if (total > 0 && onProgress) {
        onProgress({ episodeId: episode.id, loaded, total, percent });
      }
    }

    store.updateProgress(episode.id, { status: "saving" });
    const blob = new Blob(chunks, { type: "audio/mpeg" });
    await saveDownload(episode, blob);
    await requestPersistentStorage();

    store.updateProgress(episode.id, { status: "completed", percent: 100 });
    toast.success(`Downloaded "${episode.title}"`);
    store.removeDownload(episode.id);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`Download failed for "${episode.title}":`, msg);
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
