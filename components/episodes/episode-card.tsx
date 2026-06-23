"use client";

import { Download, Play } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { WaveformSeal } from "@/components/ui/waveform-seal";
import { formatDuration } from "@/lib/audio";
import { usePlayerStore } from "@/store/player";
import type { Episode } from "@/types";

interface EpisodeCardProps {
  episode: Episode;
  className?: string;
  onDownload?: (episode: Episode) => void;
}

export function EpisodeCard({
  episode,
  className,
  onDownload,
}: EpisodeCardProps) {
  const { setEpisode } = usePlayerStore();

  return (
    <div
      className={cn(
        "flex w-[180px] shrink-0 flex-col gap-2 rounded-lg border border-sand-200 bg-sand-100 p-3",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <Avatar
          size="sm"
          src={episode.scholar?.photo_url ?? undefined}
          fallback={episode.scholar?.name ?? "?"}
          alt={episode.scholar?.name ?? ""}
        />
        <span className="font-mono text-xs text-sand-300">
          {formatDuration(episode.duration_seconds ?? 0)}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-forest-900 line-clamp-2">
          {episode.title}
        </h3>
        <p className="mt-0.5 text-xs text-forest-700">
          {episode.scholar?.name}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {episode.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="default" className="text-[11px]">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEpisode(episode)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-500 text-white hover:bg-forest-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
          aria-label={`Play: ${episode.title}`}
        >
          <Play className="h-4 w-4" />
        </button>

        {onDownload && (
          <button
            type="button"
            onClick={() => onDownload(episode)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-sand-300 hover:text-forest-700 hover:bg-forest-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
            aria-label={`Download: ${episode.title}`}
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function EpisodeCardSkeleton() {
  return (
    <div className="flex w-[180px] shrink-0 flex-col gap-2 rounded-lg border border-sand-200 bg-sand-100 p-3">
      <div className="flex items-start justify-between">
        <div className="h-8 w-8 rounded-full bg-sand-200 animate-pulse" />
        <div className="h-3 w-10 rounded bg-sand-200 animate-pulse" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-full rounded bg-sand-200 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-sand-200 animate-pulse" />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-5 w-12 rounded-full bg-sand-200 animate-pulse" />
        <div className="h-5 w-12 rounded-full bg-sand-200 animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-sand-200 animate-pulse" />
        <WaveformSeal variant="skeleton" />
      </div>
    </div>
  );
}
