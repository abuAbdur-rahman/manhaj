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
    };
    indexes: { "by-date": string };
  };
}

const DB_NAME = "manhaj";
const DB_VERSION = 2;
const OPEN_TIMEOUT_MS = 8_000;

let dbPromise: ReturnType<typeof openDB<ManhajDB>> | null = null;

async function getDb(): Promise<IDBPDatabase<ManhajDB>> {
  if (dbPromise) return dbPromise;

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

export async function saveDownload(
  episode: Episode,
  audioBlob: Blob,
): Promise<void> {
  const db = await getDb();
  await db.put("downloads", {
    episode,
    audioBlob,
    downloadedAt: new Date().toISOString(),
    fileSizeBytes: audioBlob.size,
  });
}

export async function listDownloads(): Promise<
  Array<{
    episode: Episode;
    audioBlob: Blob;
    downloadedAt: string;
    fileSizeBytes: number;
  }>
> {
  const db = await getDb();
  return db.getAll("downloads");
}

export async function removeDownload(episodeId: string): Promise<void> {
  const db = await getDb();
  await db.delete("downloads", episodeId);
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
  const downloads = await listDownloads();
  return downloads.reduce((sum, d) => sum + d.fileSizeBytes, 0);
}
