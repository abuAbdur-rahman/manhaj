"use client";

import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MiniPlayer } from "@/components/layout/mini-player";
import { usePlayerStore } from "@/store/player";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);

  return (
    <>
      {children}
      <MiniPlayer
        className={currentEpisode ? "fixed bottom-14 left-0 right-0 z-30" : ""}
      />
      <BottomNav />
    </>
  );
}
