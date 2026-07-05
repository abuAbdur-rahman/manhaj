import { type DBSchema, openDB } from "idb";
import type { DownloadedEpisode } from "@/types";

interface ManhajDB extends DBSchema {
  downloads: {
    key: string;
    value: DownloadedEpisode;
  };
}

let dbPromise: ReturnType<typeof openDB<ManhajDB>> | null = null;

async function getDb() {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<ManhajDB>("manhaj", 1, {
      upgrade(db) {
        db.createObjectStore("downloads");
      },
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

export async function listDownloads() {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("downloads");
}

export async function removeDownload(episodeId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete("downloads", episodeId);
}
