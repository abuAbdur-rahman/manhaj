import { type DBSchema, type IDBPDatabase, openDB } from "idb";

interface PlaysDB extends DBSchema {
  plays: {
    key: string;
    value: {
      id: string;
      episodeId: string;
      source: "stream" | "offline";
      playedAt: string;
    };
    indexes: { "by-played": string; "by-episode": string };
  };
}

const DB_NAME = "manhaj-plays";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PlaysDB>> | null = null;

function getDb(): Promise<IDBPDatabase<PlaysDB>> {
  if (dbPromise) return dbPromise;
  dbPromise = openDB<PlaysDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore("plays", { keyPath: "id" });
      store.createIndex("by-played", "playedAt");
      store.createIndex("by-episode", "episodeId");
    },
  }).catch((err) => {
    dbPromise = null;
    throw err;
  });
  return dbPromise;
}

export async function logPlayLocal(
  episodeId: string,
  source: "stream" | "offline",
): Promise<void> {
  try {
    const db = await getDb();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.put("plays", {
      id,
      episodeId,
      source,
      playedAt: new Date().toISOString(),
    });
  } catch {}
}

export async function listPlays(
  limit = 200,
): Promise<PlaysDB["plays"]["value"][]> {
  try {
    const db = await getDb();
    const all = await db.getAllFromIndex("plays", "by-played");
    all.reverse();
    return limit ? all.slice(0, limit) : all;
  } catch {
    return [];
  }
}
