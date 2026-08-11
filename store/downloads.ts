"use client";

import { create } from "zustand";
import type { Episode } from "@/types";

export interface DownloadProgress {
  episodeId: string;
  episode: Episode;
  loaded: number;
  total: number;
  percent: number;
  status: "downloading" | "saving" | "completed" | "error";
  error?: string;
  /** Hidden from the floating toaster but still downloading. */
  dismissed?: boolean;
}

interface DownloadsStore {
  inProgress: DownloadProgress[];
  addDownload: (episode: Episode) => void;
  resetDownload: (episode: Episode) => void;
  updateProgress: (
    episodeId: string,
    partial: Partial<DownloadProgress>,
  ) => void;
  removeDownload: (episodeId: string) => void;
  /**
   * Hide a download from the floating toaster.
   * For active downloads this only hides the chip (download keeps running);
   * for terminal states (completed/error) it removes the entry.
   */
  dismissDownload: (episodeId: string) => void;
}

const ACTIVE: DownloadProgress["status"][] = ["downloading", "saving"];

function initialDownload(episode: Episode): DownloadProgress {
  return {
    episodeId: episode.id,
    episode,
    loaded: 0,
    total: 0,
    percent: 0,
    status: "downloading",
    dismissed: false,
  };
}

export const useDownloadsStore = create<DownloadsStore>((set) => ({
  inProgress: [],

  addDownload: (episode) =>
    set((state) => {
      if (state.inProgress.some((d) => d.episodeId === episode.id))
        return state;
      return {
        inProgress: [...state.inProgress, initialDownload(episode)],
      };
    }),

  resetDownload: (episode) =>
    set((state) => ({
      inProgress: [
        ...state.inProgress.filter((d) => d.episodeId !== episode.id),
        initialDownload(episode),
      ],
    })),

  updateProgress: (episodeId, partial) =>
    set((state) => ({
      inProgress: state.inProgress.map((d) =>
        d.episodeId === episodeId ? { ...d, ...partial } : d,
      ),
    })),

  removeDownload: (episodeId) =>
    set((state) => ({
      inProgress: state.inProgress.filter((d) => d.episodeId !== episodeId),
    })),

  dismissDownload: (episodeId) =>
    set((state) => {
      const entry = state.inProgress.find((d) => d.episodeId === episodeId);
      if (!entry) return state;
      if (ACTIVE.includes(entry.status)) {
        return {
          inProgress: state.inProgress.map((d) =>
            d.episodeId === episodeId ? { ...d, dismissed: true } : d,
          ),
        };
      }
      return {
        inProgress: state.inProgress.filter((d) => d.episodeId !== episodeId),
      };
    }),
}));
