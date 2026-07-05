import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { DownloadedEpisode } from "@/types";

interface ManhajDB extends DBSchema {
  downloads: {
    key: string;
    value: DownloadedEpisode;
  };
}

let dbPromise: Promise<IDBPDatabase<ManhajDB> | null> | null = null;

async function getDb() {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<ManhajDB>("manhaj", 1, {
      upgrade(db) {
        db.createObjectStore("downloads");
      },
    }).catch((err) => {
      console.error("IndexedDB open failed, will retry:", err);
      dbPromise = null;
      return null;
    });
  }
  return dbPromise;
}

export async function saveDownload(
  episode: DownloadedEpisode["episode"],
  fileSizeBytes: number,
  cacheKey: string,
  audioBlob: Blob,
) {
  const db = await getDb();
  if (!db) return;
  await db.put(
    "downloads",
    {
      episode,
      downloadedAt: new Date().toISOString(),
      fileSizeBytes,
      cacheKey,
      audioBlob,
    },
    episode.id,
  );
}

export async function listDownloads(): Promise<DownloadedEpisode[]> {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("downloads");
}

export async function removeDownload(episodeId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete("downloads", episodeId);
}
