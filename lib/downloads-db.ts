import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { Episode } from "@/types";

interface ManhajDB extends DBSchema {
  downloads: {
    key: string;
    value: {
      episode: Episode;
      audioBlob: Blob;
      downloadedAt: string;
      fileSizeBytes: number;
      audioOutdated?: boolean;
    };
    indexes: { "by-date": string };
  };
  downloadMetadata: {
    key: string;
    value: DownloadMetadata;
    indexes: { "by-date": string };
  };
  playbackHistory: {
    key: string;
    value: PlaybackHistory;
    indexes: { "by-updated": string };
  };
}

export interface PlaybackHistory {
  episodeId: string;
  episodeSlug: string;
  position: number;
  duration: number;
  speed: number;
  updatedAt: string;
}

const DB_NAME = "manhaj";
const DB_VERSION = 4;
const OPEN_TIMEOUT_MS = 8_000;

let dbPromise: ReturnType<typeof openDB<ManhajDB>> | null = null;
let backfillPromise: Promise<void> | null = null;

async function getDb(): Promise<IDBPDatabase<ManhajDB>> {
  if (dbPromise) {
    await ensureMetadataBackfilled(dbPromise);
    return dbPromise;
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("IndexedDB open timed out after 8s")),
      OPEN_TIMEOUT_MS,
    ),
  );

  dbPromise = Promise.race([
    openDB<ManhajDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore("downloads", {
            keyPath: "episode.id",
          });
          store.createIndex("by-date", "downloadedAt");
        }
        if (oldVersion === 1) {
          try {
            db.deleteObjectStore("downloads");
          } catch {
            // may not exist
          }
          const store = db.createObjectStore("downloads", {
            keyPath: "episode.id",
          });
          store.createIndex("by-date", "downloadedAt");
        }
        if (oldVersion < 3) {
          const history = db.createObjectStore("playbackHistory", {
            keyPath: "episodeId",
          });
          history.createIndex("by-updated", "updatedAt");
        }
        if (oldVersion < 4) {
          const metadata = db.createObjectStore("downloadMetadata", {
            keyPath: "episode.id",
          });
          metadata.createIndex("by-date", "downloadedAt");
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

  await ensureMetadataBackfilled(dbPromise);
  return dbPromise;
}

function ensureMetadataBackfilled(
  dbPromiseArg: Promise<IDBPDatabase<ManhajDB>>,
): Promise<void> {
  if (!backfillPromise) {
    backfillPromise = dbPromiseArg
      .then((db) => backfillDownloadMetadata(db))
      .catch((err) => {
        backfillPromise = null;
        throw err;
      });
  }
  return backfillPromise;
}

async function backfillDownloadMetadata(db: IDBPDatabase<ManhajDB>) {
  const downloads = await db.getAll("downloads");
  const metadata = db.transaction("downloadMetadata", "readwrite");
  for (const download of downloads) {
    if (!(await metadata.store.get(download.episode.id))) {
      await metadata.store.put({
        episode: download.episode,
        downloadedAt: download.downloadedAt,
        fileSizeBytes: download.fileSizeBytes,
        audioOutdated: download.audioOutdated ?? false,
      });
    }
  }
  await metadata.done;
}

export async function saveDownload(
  episode: Episode,
  audioBlob: Blob,
): Promise<void> {
  const db = await getDb();
  const record = {
    episode,
    audioBlob,
    downloadedAt: new Date().toISOString(),
    fileSizeBytes: audioBlob.size,
    audioOutdated: false,
  };
  const tx = db.transaction(["downloads", "downloadMetadata"], "readwrite");
  await Promise.all([
    tx.objectStore("downloads").put(record),
    tx.objectStore("downloadMetadata").put({
      episode,
      downloadedAt: record.downloadedAt,
      fileSizeBytes: record.fileSizeBytes,
      audioOutdated: false,
    }),
    tx.done,
  ]);
}

export async function listDownloads(): Promise<
  Array<{
    episode: Episode;
    audioBlob: Blob;
    downloadedAt: string;
    fileSizeBytes: number;
    audioOutdated?: boolean;
  }>
> {
  const db = await getDb();
  return db.getAll("downloads");
}

export type DownloadMetadata = {
  episode: Episode;
  downloadedAt: string;
  fileSizeBytes: number;
  audioOutdated: boolean;
};

/**
 * Like {@link listDownloads} but drops the audio Blob — used by the TanStack
 * Query-backed list/ids hooks so the in-memory cache never retains large
 * audio buffers. Offline playback resolves Blobs directly from IndexedDB
 * via the AudioProvider.
 */
export async function listDownloadMetadata(): Promise<DownloadMetadata[]> {
  const db = await getDb();
  return db.getAll("downloadMetadata");
}

export function reconcileDownloadedEpisode(
  downloaded: Episode,
  current: Episode,
): { episode: Episode; audioOutdated: boolean } {
  if (downloaded.updated_at === current.updated_at) {
    return { episode: downloaded, audioOutdated: false };
  }
  if (downloaded.audio_url !== current.audio_url) {
    return { episode: downloaded, audioOutdated: true };
  }
  return { episode: current, audioOutdated: false };
}

export async function updateDownloadedEpisodeMetadata(
  current: Episode,
): Promise<{ updated: boolean; audioOutdated: boolean }> {
  const db = await getDb();
  const stored = await db.get("downloads", current.id);
  if (!stored) return { updated: false, audioOutdated: false };
  const reconciliation = reconcileDownloadedEpisode(stored.episode, current);
  if (
    reconciliation.audioOutdated !== (stored.audioOutdated ?? false) ||
    (!reconciliation.audioOutdated && reconciliation.episode !== stored.episode)
  ) {
    const updated = {
      ...stored,
      episode: reconciliation.episode,
      audioOutdated: reconciliation.audioOutdated,
    };
    const tx = db.transaction(["downloads", "downloadMetadata"], "readwrite");
    await Promise.all([
      tx.objectStore("downloads").put(updated),
      tx.objectStore("downloadMetadata").put({
        episode: updated.episode,
        downloadedAt: updated.downloadedAt,
        fileSizeBytes: updated.fileSizeBytes,
        audioOutdated: updated.audioOutdated,
      }),
      tx.done,
    ]);
    return {
      updated: true,
      audioOutdated: reconciliation.audioOutdated,
    };
  }
  return { updated: false, audioOutdated: reconciliation.audioOutdated };
}

export async function removeDownload(episodeId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["downloads", "downloadMetadata"], "readwrite");
  await Promise.all([
    tx.objectStore("downloads").delete(episodeId),
    tx.objectStore("downloadMetadata").delete(episodeId),
    tx.done,
  ]);
}

export async function getDownloadById(episodeId: string): Promise<{
  episode: Episode;
  audioBlob: Blob;
  downloadedAt: string;
  fileSizeBytes: number;
} | null> {
  const db = await getDb();
  return (await db.get("downloads", episodeId)) ?? null;
}

export async function getDownloadBySlug(slug: string): Promise<{
  episode: Episode;
  audioBlob: Blob;
  downloadedAt: string;
  fileSizeBytes: number;
} | null> {
  const downloads = await listDownloads();
  return downloads.find((d) => d.episode.slug === slug) ?? null;
}

export async function getTotalDownloadSize(): Promise<number> {
  const downloads = await listDownloadMetadata();
  return downloads.reduce((sum, d) => sum + d.fileSizeBytes, 0);
}

export async function savePlaybackHistory(
  history: PlaybackHistory,
): Promise<void> {
  const db = await getDb();
  await db.put("playbackHistory", history);
}

export async function getPlaybackHistory(
  episodeId: string,
): Promise<PlaybackHistory | undefined> {
  const db = await getDb();
  return db.get("playbackHistory", episodeId);
}

export async function removePlaybackHistory(episodeId: string): Promise<void> {
  const db = await getDb();
  await db.delete("playbackHistory", episodeId);
}

export function getResumePosition(
  history: PlaybackHistory | undefined,
  duration: number,
): number | null {
  if (!history || history.position < 10) return null;
  const effectiveDuration = duration > 0 ? duration : history.duration;
  if (effectiveDuration > 0 && history.position >= effectiveDuration - 30) {
    return null;
  }
  return history.position;
}
