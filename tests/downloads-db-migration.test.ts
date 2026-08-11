import "fake-indexeddb/auto";
import { openDB } from "idb";
import { describe, expect, it } from "vitest";
import { listDownloadMetadata } from "@/lib/downloads-db";
import type { Episode } from "@/types";

const episode = (id: string): Episode => ({
  id,
  series_id: null,
  scholar_id: "scholar",
  title: "Episode",
  slug: id,
  description: null,
  audio_url: "https://audio.test/episode.mp3",
  duration_seconds: 120,
  language: "english",
  tags: [],
  recorded_date: null,
  play_count: 0,
  is_published: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

describe("downloads database migration", () => {
  it("backfills downloadMetadata from downloads when upgrading to v4", async () => {
    const v3 = await openDB("manhaj", 3, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("downloads")) {
          const store = db.createObjectStore("downloads", {
            keyPath: "episode.id",
          });
          store.createIndex("by-date", "downloadedAt");
        }
        if (!db.objectStoreNames.contains("playbackHistory")) {
          const history = db.createObjectStore("playbackHistory", {
            keyPath: "episodeId",
          });
          history.createIndex("by-updated", "updatedAt");
        }
      },
    });

    const existing = episode("pre-upgrade");
    await v3.add("downloads", {
      episode: existing,
      audioBlob: new Blob([new Uint8Array(2048)]),
      downloadedAt: "2026-01-02T00:00:00Z",
      fileSizeBytes: 2048,
      audioOutdated: false,
    });
    v3.close();

    const metadata = await listDownloadMetadata();

    const listed = metadata.find((item) => item.episode.id === "pre-upgrade");
    expect(listed).toEqual(
      expect.objectContaining({
        episode: expect.objectContaining({ id: "pre-upgrade" }),
        fileSizeBytes: 2048,
        downloadedAt: "2026-01-02T00:00:00Z",
      }),
    );
    expect(Object.hasOwn(listed ?? {}, "audioBlob")).toBe(false);
  });
});
