import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import {
  getDownloadById,
  getResumePosition,
  listDownloadMetadata,
  type PlaybackHistory,
  reconcileDownloadedEpisode,
  saveDownload,
} from "@/lib/downloads-db";
import type { Episode } from "@/types";

const history = (position: number): PlaybackHistory => ({
  episodeId: "episode",
  episodeSlug: "episode",
  position,
  duration: 120,
  speed: 1,
  updatedAt: "2026-01-01T00:00:00Z",
});

const episode = (updatedAt: string, audioUrl: string): Episode => ({
  id: "episode",
  series_id: null,
  scholar_id: "scholar",
  title: "Episode",
  slug: "episode",
  description: null,
  audio_url: audioUrl,
  duration_seconds: 120,
  language: "english",
  tags: [],
  recorded_date: null,
  play_count: 0,
  is_published: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: updatedAt,
});

describe("resume policy", () => {
  it("ignores trivial and nearly completed positions", () => {
    expect(getResumePosition(history(9), 120)).toBeNull();
    expect(getResumePosition(history(91), 120)).toBeNull();
  });

  it("resumes a meaningful in-progress episode", () => {
    expect(getResumePosition(history(45), 120)).toBe(45);
  });
});

describe("cached edit reconciliation", () => {
  it("refreshes metadata when audio identity is unchanged", () => {
    const stored = episode("2026-01-01T00:00:00Z", "https://audio.test/a.mp3");
    const current = {
      ...episode("2026-02-01T00:00:00Z", stored.audio_url ?? ""),
      title: "Revised",
    };
    expect(reconcileDownloadedEpisode(stored, current)).toEqual({
      episode: current,
      audioOutdated: false,
    });
  });

  it("keeps the downloaded snapshot when audio changed", () => {
    const stored = episode("2026-01-01T00:00:00Z", "https://audio.test/a.mp3");
    const current = episode("2026-02-01T00:00:00Z", "https://audio.test/b.mp3");
    expect(reconcileDownloadedEpisode(stored, current)).toEqual({
      episode: stored,
      audioOutdated: true,
    });
  });
});

describe("download metadata storage", () => {
  it("lists metadata without returning stored audio blobs", async () => {
    const stored = episode(
      "2026-01-01T00:00:00Z",
      "https://audio.test/metadata.mp3",
    );
    stored.id = "metadata-only";
    await saveDownload(stored, new Blob([new Uint8Array(1024)]));

    const metadata = await listDownloadMetadata();

    const listed = metadata.find((item) => item.episode.id === stored.id);
    expect(listed).toEqual(expect.objectContaining({ fileSizeBytes: 1024 }));
    expect(Object.hasOwn(listed ?? {}, "audioBlob")).toBe(false);
    expect(await getDownloadById(stored.id)).toEqual(
      expect.objectContaining({ audioBlob: expect.any(Blob) }),
    );
  });
});
