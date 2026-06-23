"use client";

import { Pause, Play, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { WaveformSeal } from "@/components/ui/waveform-seal";
import { formatDuration } from "@/lib/audio";
import { usePlayerStore } from "@/store/player";

export function MiniPlayer({ className }: { className?: string }) {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    setPlaying,
    clear,
  } = usePlayerStore();

  if (!currentEpisode) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 h-14 px-4 bg-sand-100 border-t border-sand-200",
        className,
      )}
    >
      <Avatar
        size="sm"
        src={currentEpisode.scholar?.photo_url ?? undefined}
        fallback={currentEpisode.scholar?.name ?? "?"}
        alt={currentEpisode.scholar?.name ?? ""}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-forest-900 truncate">
          {currentEpisode.title}
        </p>
        <p className="text-xs text-sand-300 truncate font-mono">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </p>
      </div>

      <WaveformSeal variant="inline" className="opacity-40" />

      <button
        type="button"
        onClick={() => setPlaying(!isPlaying)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-forest-500 hover:bg-forest-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </button>

      <button
        type="button"
        onClick={clear}
        className="flex h-11 w-11 items-center justify-center rounded-full text-sand-300 hover:text-forest-700 hover:bg-forest-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
        aria-label="Close player"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
