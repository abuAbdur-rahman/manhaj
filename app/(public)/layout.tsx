"use client";

import type { ReactNode } from "react";
import { AudioProvider } from "@/components/layout/audio-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { InstallBanner } from "@/components/layout/install-banner";
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
        <MiniPlayer className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.25rem)] left-2 right-2 z-30" />
      )}
      <InstallBanner
        className={
          currentEpisode
            ? "fixed bottom-[calc(7rem+env(safe-area-inset-bottom)+0.75rem)] left-2 right-2 z-50 flex items-center justify-between gap-3 rounded-2xl bg-forest-900 px-4 py-3 text-white shadow-lg dark:bg-ink-800"
            : undefined
        }
      />
      <BottomNav />
    </>
  );
}
