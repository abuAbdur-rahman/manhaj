"use client";

import { Pause, Play, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { WaveformSeal } from "@/components/ui/waveform-seal";
import { formatDuration } from "@/lib/audio";
import { useDownloadedIds } from "@/lib/use-downloaded";
import { usePlayerStore } from "@/store/player";

export function MiniPlayer({ className }: { className?: string }) {
  const router = useRouter();
  const downloadedIds = useDownloadedIds();

  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    setPlaying,
    clear,
  } = usePlayerStore();

  if (!currentEpisode) return null;

  const handleNavigate = () => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine &&
      downloadedIds.has(currentEpisode.id)
    ) {
      window.location.href = `/offline/${currentEpisode.slug}`;
    } else {
      router.push(`/lectures/${currentEpisode.slug}`);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: wrapper contains nested action buttons, so a native button would be invalid HTML.
    <div
      className={cn(
        "flex h-14 cursor-pointer items-center gap-3 rounded-2xl border border-sand-200 bg-sand-50/95 px-4 shadow-[0_-4px_16px_rgba(15,65,38,0.12)] backdrop-blur dark:border-ink-700 dark:bg-ink-800/95 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]",
        className,
      )}
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
        }
      }}
    >
      {currentEpisode.scholar?.photo_url ? (
        <Avatar
          size="sm"
          src={currentEpisode.scholar.photo_url}
          alt={currentEpisode.scholar?.name ?? ""}
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-400 to-forest-600 text-xs font-bold text-white">
          {currentEpisode.scholar?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-forest-900 truncate dark:text-ink-100">
          {currentEpisode.title}
        </p>
        <p className="text-xs text-sand-300 truncate font-mono dark:text-ink-500">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </p>
      </div>

      <WaveformSeal variant="inline" className="opacity-40" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPlaying(!isPlaying);
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full text-forest-500 transition-colors hover:bg-forest-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-100 dark:hover:bg-ink-700"
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
        onClick={(e) => {
          e.stopPropagation();
          clear();
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full text-sand-300 transition-colors hover:bg-forest-50 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:bg-ink-700 dark:hover:text-ink-100"
        aria-label="Close player"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
