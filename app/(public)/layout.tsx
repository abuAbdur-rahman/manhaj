"use client";

import type { ReactNode } from "react";
import { AudioProvider } from "@/components/layout/audio-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DownloadToaster } from "@/components/layout/download-toaster";
import { MiniPlayer } from "@/components/layout/mini-player";
import { OfflineDetector } from "@/components/layout/offline-detector";
import { usePlayerStore } from "@/store/player";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);

  return (
    <>
      <AudioProvider />
      <OfflineDetector />
      <DownloadToaster />
      <div className="flex min-h-screen flex-col">
        {children}
        <div
          className={
            currentEpisode
              ? "h-[calc(8rem+env(safe-area-inset-bottom))]"
              : "h-[calc(4rem+env(safe-area-inset-bottom))]"
          }
          aria-hidden="true"
        />
      </div>
      {currentEpisode && (
        <MiniPlayer className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.25rem)] left-2 right-2 z-30" />
      )}
      <BottomNav />
    </>
  );
}
