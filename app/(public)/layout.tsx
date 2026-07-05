"use client";

import type { ReactNode } from "react";
import { AudioProvider } from "@/components/layout/audio-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MiniPlayer } from "@/components/layout/mini-player";
import { OfflineDetector } from "@/components/layout/offline-detector";
import { usePlayerStore } from "@/store/player";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);

  return (
    <>
      <AudioProvider />
      <OfflineDetector />
      <div className="flex min-h-screen flex-col">
        {children}
        <div
          className={
            currentEpisode
              ? "h-[calc(7rem+env(safe-area-inset-bottom))]"
              : "h-[calc(3.5rem+env(safe-area-inset-bottom))]"
          }
          aria-hidden="true"
        />
      </div>
      {currentEpisode && (
        <MiniPlayer className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30" />
      )}
      <BottomNav />
    </>
  );
}
