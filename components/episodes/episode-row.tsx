"use client";

import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { formatDuration } from "@/lib/audio";
import { usePlayerStore } from "@/store/player";
import type { Episode } from "@/types";

interface EpisodeRowProps {
  episode: Episode;
  index?: number;
  className?: string;
  onDownload?: (episode: Episode) => void;
}

export function EpisodeRow({
  episode,
  index,
  className,
  onDownload,
}: EpisodeRowProps) {
  const { setEpisode } = usePlayerStore();

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-sand-100 dark:hover:bg-ink-800",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setEpisode(episode)}
        className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer"
        aria-label={`Play: ${episode.title}`}
      >
        {index !== undefined && (
          <span className="w-6 text-right font-mono text-sm text-sand-300 shrink-0 dark:text-ink-500">
            {index}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-forest-900 truncate dark:text-ink-100">
            {episode.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-forest-700 dark:text-ink-500">
              {episode.language}
            </span>
            {episode.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="default" className="text-[11px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <span className="font-mono text-xs text-sand-300 shrink-0 dark:text-ink-500">
          {formatDuration(episode.duration_seconds ?? 0)}
        </span>
      </button>

      {onDownload && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(episode);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full text-sand-300 hover:text-forest-700 hover:bg-forest-50 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-100"
          aria-label={`Download: ${episode.title}`}
        >
          <Download className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function EpisodeRowSkeleton({ index }: { index?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
      {index !== undefined && (
        <div className="h-4 w-6 rounded bg-sand-200 animate-pulse shrink-0 dark:bg-ink-800" />
      )}
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-3/4 rounded bg-sand-200 animate-pulse dark:bg-ink-800" />
        <div className="flex items-center gap-2">
          <div className="h-3 w-10 rounded bg-sand-200 animate-pulse dark:bg-ink-800" />
          <div className="h-5 w-12 rounded-full bg-sand-200 animate-pulse dark:bg-ink-800" />
        </div>
      </div>
      <div className="h-3 w-10 rounded bg-sand-200 animate-pulse shrink-0 dark:bg-ink-800" />
    </div>
  );
}
