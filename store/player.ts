import { create } from "zustand";
import type { Episode, Speed } from "@/types";

interface PlayerStore {
  currentEpisode: Episode | null;
  queue: Episode[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: Speed;
  isLoading: boolean;
  sleepTimerRemaining: number | null;
  audioRef: HTMLAudioElement | null;
  setEpisode: (episode: Episode) => void;
  setQueue: (episodes: Episode[], startIndex?: number) => void;
  playNext: () => boolean;
  playPrevious: () => boolean;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setSpeed: (speed: Speed) => void;
  setLoading: (loading: boolean) => void;
  setSleepTimer: (seconds: number | null) => void;
  tickSleepTimer: () => void;
  setAudioRef: (ref: HTMLAudioElement | null) => void;
  clear: () => void;
}

const episodeState = (episode: Episode) => ({
  currentEpisode: episode,
  currentTime: 0,
  duration: episode.duration_seconds ?? 0,
  isPlaying: true,
  isLoading: true,
});

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentEpisode: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  isLoading: false,
  sleepTimerRemaining: null,
  audioRef: null,
  setEpisode: (episode) =>
    set({
      ...episodeState(episode),
      queue: [episode],
      queueIndex: 0,
    }),
  setQueue: (episodes, startIndex = 0) => {
    if (episodes.length === 0) return;
    const safeIndex = Math.min(Math.max(startIndex, 0), episodes.length - 1);
    set({
      ...episodeState(episodes[safeIndex]),
      queue: episodes,
      queueIndex: safeIndex,
    });
  },
  playNext: () => {
    const { queue, queueIndex } = get();
    if (queueIndex < 0 || queueIndex >= queue.length - 1) {
      set({ isPlaying: false });
      return false;
    }
    const nextIndex = queueIndex + 1;
    set({ ...episodeState(queue[nextIndex]), queueIndex: nextIndex });
    return true;
  },
  playPrevious: () => {
    const { queue, queueIndex } = get();
    if (queueIndex <= 0) return false;
    const previousIndex = queueIndex - 1;
    set({ ...episodeState(queue[previousIndex]), queueIndex: previousIndex });
    return true;
  },
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setSpeed: (speed) => set({ speed }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSleepTimer: (seconds) => set({ sleepTimerRemaining: seconds }),
  setAudioRef: (ref) => set({ audioRef: ref }),
  tickSleepTimer: () => {
    const current = get().sleepTimerRemaining;
    if (current === null) return;
    if (current <= 1) {
      set({ sleepTimerRemaining: null, isPlaying: false });
    } else {
      set({ sleepTimerRemaining: current - 1 });
    }
  },
  clear: () =>
    set({
      currentEpisode: null,
      queue: [],
      queueIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      speed: 1,
      isLoading: false,
      sleepTimerRemaining: null,
      audioRef: null,
    }),
}));
