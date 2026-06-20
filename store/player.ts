import { create } from "zustand";
import type { Episode, Speed } from "@/types";

interface PlayerStore {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: Speed;
  isLoading: boolean;
  sleepTimerRemaining: number | null;
  setEpisode: (episode: Episode) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setSpeed: (speed: Speed) => void;
  setLoading: (loading: boolean) => void;
  setSleepTimer: (seconds: number | null) => void;
  tickSleepTimer: () => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  isLoading: false,
  sleepTimerRemaining: null,
  setEpisode: (episode) =>
    set({ currentEpisode: episode, currentTime: 0, isPlaying: true }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setSpeed: (speed) => set({ speed }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSleepTimer: (seconds) => set({ sleepTimerRemaining: seconds }),
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
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      sleepTimerRemaining: null,
    }),
}));
