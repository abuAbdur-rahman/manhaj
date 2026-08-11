import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import { type IDBPDatabase, openDB } from "idb";

/**
 * Persists the TanStack Query cache to IndexedDB so cached server state
 * (e.g. search results) survives reloads and works offline.
 *
 * A separate DB from the downloads store ("manhaj") to avoid version clashes.
 * Only serialisable query data is ever persisted — the provider's
 * `shouldDehydrateQuery` filter keeps blobs/heavy entries out.
 */
const DB_NAME = "manhaj-rq";
const DB_VERSION = 1;
const STORE = "kv";
const KEY = "query-cache-v1";

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDb(): Promise<IDBPDatabase | null> {
  if (typeof indexedDB === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    }).catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

export function createIdbPersister(): Persister {
  return {
    async persistClient(persisted: PersistedClient) {
      try {
        const db = await getDb();
        if (!db) return;
        await db.put(STORE, JSON.stringify(persisted), KEY);
      } catch {
        // IndexedDB unavailable or quota exceeded — drop the cache silently
      }
    },
    async restoreClient(): Promise<PersistedClient | undefined> {
      try {
        const db = await getDb();
        if (!db) return undefined;
        const raw = (await db.get(STORE, KEY)) as string | undefined;
        if (!raw) return undefined;
        return JSON.parse(raw) as PersistedClient;
      } catch {
        return undefined;
      }
    },
    async removeClient() {
      try {
        const db = await getDb();
        if (!db) return;
        await db.delete(STORE, KEY);
      } catch {
        // ignore
      }
    },
  };
}
