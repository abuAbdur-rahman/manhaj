import { type DBSchema, openDB } from "idb";
import type { DownloadedEpisode } from "@/types";

interface ManhajDB extends DBSchema {
  downloads: {
    key: string;
    value: DownloadedEpisode;
  };
}

const dbPromise = openDB<ManhajDB>("manhaj", 1, {
  upgrade(db) {
    db.createObjectStore("downloads");
  },
});

export async function saveDownload(
  episode: DownloadedEpisode["episode"],
  fileSizeBytes: number,
  cacheKey: string,
) {
  const db = await dbPromise;
  await db.put(
    "downloads",
    {
      episode,
      downloadedAt: new Date().toISOString(),
      fileSizeBytes,
      cacheKey,
    },
    episode.id,
  );
}

export async function listDownloads() {
  const db = await dbPromise;
  return db.getAll("downloads");
}

export async function removeDownload(episodeId: string) {
  const db = await dbPromise;
  await db.delete("downloads", episodeId);
}
