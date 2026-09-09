import { beforeEach, describe, expect, it } from "vitest";
import { usePlayerStore } from "@/store/player";
import type { Episode } from "@/types";

const episode = (id: string): Episode => ({
  id,
  series_id: "series",
  scholar_id: "scholar",
  title: `Episode ${id}`,
  slug: `episode-${id}`,
  description: null,
  audio_url: `https://audio.test/${id}.mp3`,
  duration_seconds: 120,
  language: "english",
  tags: [],
  recorded_date: null,
  play_count: 0,
  is_published: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

describe("player queue", () => {
  beforeEach(() => usePlayerStore.getState().clear());

  it("advances in canonical order and stops at the final episode", () => {
    usePlayerStore.getState().setQueue([episode("1"), episode("2")]);
    expect(usePlayerStore.getState().currentEpisode?.id).toBe("1");
    expect(usePlayerStore.getState().playNext()).toBe(true);
    expect(usePlayerStore.getState().currentEpisode?.id).toBe("2");
    expect(usePlayerStore.getState().playNext()).toBe(false);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it("moves backward without wrapping", () => {
    usePlayerStore.getState().setQueue([episode("1"), episode("2")], 1);
    expect(usePlayerStore.getState().playPrevious()).toBe(true);
    expect(usePlayerStore.getState().currentEpisode?.id).toBe("1");
    expect(usePlayerStore.getState().playPrevious()).toBe(false);
  });

  it("resets playback state whenever the selected episode changes", () => {
    usePlayerStore.getState().setEpisode(episode("1"));
    usePlayerStore.getState().setCurrentTime(73);
    usePlayerStore.getState().setDuration(180);

    usePlayerStore.getState().setEpisode(episode("2"));

    expect(usePlayerStore.getState()).toMatchObject({
      currentTime: 0,
      duration: 120,
      isPlaying: true,
      isLoading: true,
    });
  });

  it("resets playback state when moving through the queue", () => {
    usePlayerStore.getState().setQueue([episode("1"), episode("2")]);
    usePlayerStore.getState().setCurrentTime(73);
    usePlayerStore.getState().setDuration(180);

    usePlayerStore.getState().playNext();

    expect(usePlayerStore.getState()).toMatchObject({
      currentTime: 0,
      duration: 120,
      isLoading: true,
    });
  });
});
