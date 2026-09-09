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
}

interface DownloadsStore {
  inProgress: DownloadProgress[];
  downloadRevision: number;
  addDownload: (episode: Episode) => void;
  updateProgress: (
    episodeId: string,
    partial: Partial<DownloadProgress>,
  ) => void;
  removeDownload: (episodeId: string) => void;
  clearCompleted: () => void;
}

export const useDownloadsStore = create<DownloadsStore>((set) => ({
  inProgress: [],
  downloadRevision: 0,

  addDownload: (episode) =>
    set((state) => {
      if (state.inProgress.some((d) => d.episodeId === episode.id))
        return state;
      return {
        inProgress: [
          ...state.inProgress,
          {
            episodeId: episode.id,
            episode,
            loaded: 0,
            total: 0,
            percent: 0,
            status: "downloading",
          },
        ],
      };
    }),

  updateProgress: (episodeId, partial) =>
    set((state) => ({
      inProgress: state.inProgress.map((d) =>
        d.episodeId === episodeId ? { ...d, ...partial } : d,
      ),
    })),

  removeDownload: (episodeId) =>
    set((state) => ({
      inProgress: state.inProgress.filter((d) => d.episodeId !== episodeId),
      downloadRevision: state.downloadRevision + 1,
    })),

  clearCompleted: () =>
    set((state) => ({
      inProgress: state.inProgress.filter((d) => d.status === "downloading"),
    })),
}));
