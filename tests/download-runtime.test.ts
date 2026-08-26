import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelDownload,
  downloadEpisode,
  evictDownload,
  pauseDownload,
  resumeDownload,
} from "@/lib/download";
import {
  getDownloadById,
  getPlaybackHistory,
  saveDownload,
  savePlaybackHistory,
} from "@/lib/downloads-db";
import { useDownloadsStore } from "@/store/downloads";
import type { Episode } from "@/types";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn(), warning: vi.fn() },
}));

const episode: Episode = {
  id: "download-runtime",
  series_id: null,
  scholar_id: "scholar",
  title: "Runtime download",
  slug: "runtime-download",
  description: null,
  audio_url: "https://audio.test/runtime.mp3",
  duration_seconds: 120,
  language: "english",
  tags: [],
  recorded_date: null,
  play_count: 0,
  is_published: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function streamResponse(chunks: Array<Uint8Array | Error>) {
  let index = 0;
  return new Response(
    new ReadableStream({
      pull(controller) {
        const chunk = chunks[index++];
        if (chunk instanceof Error) return controller.error(chunk);
        if (chunk) controller.enqueue(chunk);
        else controller.close();
      },
    }),
    { status: 200, headers: { "content-length": "3" } },
  );
}

describe("download runtime recovery", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        storage: {
          estimate: vi
            .fn()
            .mockResolvedValue({ quota: 100 * 1024 * 1024, usage: 0 }),
          persist: vi.fn(),
        },
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: Object.assign(globalThis, { setTimeout, clearTimeout }),
    });
    Object.defineProperty(globalThis, "caches", {
      configurable: true,
      value: {
        open: vi.fn().mockResolvedValue({
          put: vi.fn(),
          delete: vi.fn().mockResolvedValue(true),
        }),
      },
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("restarts the full transfer after a mid-stream network failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        streamResponse([new Uint8Array([1]), new Error("network interrupted")]),
      )
      .mockResolvedValueOnce(streamResponse([new Uint8Array([1, 2, 3])]))
      .mockResolvedValue(new Response("page", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(downloadEpisode(episode)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect((await getDownloadById(episode.id))?.audioBlob.size).toBe(3);
  });

  it("pauses and resumes an active streamed transfer", async () => {
    const pausedEpisode = { ...episode, id: "pause-runtime" };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        streamResponse([
          new Uint8Array([1]),
          new Uint8Array([2]),
          new Uint8Array([3]),
        ]),
      )
      .mockResolvedValue(new Response("page", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    let paused = false;
    const pending = downloadEpisode(pausedEpisode, () => {
      if (!paused) {
        paused = true;
        pauseDownload(pausedEpisode.id);
      }
    });

    await vi.waitFor(() => {
      expect(
        useDownloadsStore
          .getState()
          .inProgress.find((item) => item.episodeId === pausedEpisode.id)
          ?.status,
      ).toBe("paused");
    });
    resumeDownload(pausedEpisode.id);

    await expect(pending).resolves.toBe(true);
    expect((await getDownloadById(pausedEpisode.id))?.audioBlob.size).toBe(3);
  });

  it("cancels an active transfer without retaining a partial record", async () => {
    let markStarted: (() => void) | undefined;
    const started = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, init) => {
        markStarted?.();
        return new Promise((_resolve, reject) => {
          if (init?.signal?.aborted) {
            reject(new DOMException("cancelled", "AbortError"));
            return;
          }
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("cancelled", "AbortError")),
          );
        });
      }),
    );
    const pending = downloadEpisode({ ...episode, id: "cancel-runtime" });
    await started;
    cancelDownload("cancel-runtime");
    await expect(pending).resolves.toBe(false);
    expect(await getDownloadById("cancel-runtime")).toBeNull();
  });

  it("evicts audio, playback history, and related cache keys", async () => {
    await saveDownload(episode, new Blob([new Uint8Array([1, 2, 3])]));
    await savePlaybackHistory({
      episodeId: episode.id,
      episodeSlug: episode.slug,
      position: 45,
      duration: 120,
      speed: 1,
      updatedAt: new Date().toISOString(),
    });

    await evictDownload(episode.id, episode.slug, episode.audio_url ?? "");
    expect(await getDownloadById(episode.id)).toBeNull();
    expect(await getPlaybackHistory(episode.id)).toBeUndefined();
    const cache = await caches.open("manhaj-pages");
    expect(cache.delete).toHaveBeenCalled();
  });

  it("evicts local data when the stored audio URL is missing", async () => {
    const noUrlEpisode = {
      ...episode,
      id: "download-without-url",
      slug: "download-without-url",
      audio_url: null,
    };
    await saveDownload(noUrlEpisode, new Blob([new Uint8Array([1, 2, 3])]));
    await savePlaybackHistory({
      episodeId: noUrlEpisode.id,
      episodeSlug: noUrlEpisode.slug,
      position: 45,
      duration: 120,
      speed: 1,
      updatedAt: new Date().toISOString(),
    });

    await evictDownload(noUrlEpisode.id, noUrlEpisode.slug, null);

    expect(await getDownloadById(noUrlEpisode.id)).toBeNull();
    expect(await getPlaybackHistory(noUrlEpisode.id)).toBeUndefined();
  });
});
