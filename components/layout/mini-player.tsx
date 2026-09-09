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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
        "relative flex h-[60px] cursor-pointer items-center gap-3 rounded-2xl border border-sand-200/80 bg-sand-50/95 px-3 shadow-[0_4px_24px_rgba(15,65,38,0.10)] backdrop-blur-lg",
        "motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:shadow-[0_6px_28px_rgba(15,65,38,0.14)]",
        "dark:border-ink-700/60 dark:bg-ink-800/95 dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        "touch-bounce overflow-hidden",
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
      {/* Progress bar at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-sand-200/60 dark:bg-ink-700/60"
        aria-hidden="true"
      >
        <div
          className="h-full bg-forest-500/80 motion-safe:transition-[width] motion-safe:duration-300 ease-out dark:bg-forest-500/60"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentEpisode.scholar?.photo_url ? (
        <Avatar
          size="sm"
          src={currentEpisode.scholar.photo_url}
          alt={currentEpisode.scholar?.name ?? ""}
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-500 to-forest-700 text-xs font-bold text-white shadow-sm">
          {currentEpisode.scholar?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-forest-900 truncate dark:text-ink-100">
          {currentEpisode.title}
        </p>
        <p className="text-[11px] text-sand-300 truncate font-mono dark:text-ink-500">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </p>
      </div>

      <WaveformSeal variant="inline" className="opacity-30 hidden sm:flex" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPlaying(!isPlaying);
        }}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full",
          "bg-forest-500 text-white shadow-sm",
          "motion-safe:transition-all motion-safe:duration-150 hover:bg-forest-600 active:scale-95",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
          "dark:bg-forest-600 dark:hover:bg-forest-500",
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
        )}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          clear();
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-sand-300 motion-safe:transition-colors hover:bg-sand-200/60 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:bg-ink-700 dark:hover:text-ink-100"
        aria-label="Close player"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
