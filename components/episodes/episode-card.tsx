"use client";

import { Download, Play } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { WaveformSeal } from "@/components/ui/waveform-seal";
import { formatDuration } from "@/lib/audio";
import { usePlayerStore } from "@/store/player";
import type { Episode } from "@/types";

interface EpisodeCardProps {
  episode: Episode;
  href?: string;
  className?: string;
  onDownload?: (episode: Episode) => void;
}

export function EpisodeCard({
  episode,
  href,
  className,
  onDownload,
}: EpisodeCardProps) {
  const { setEpisode } = usePlayerStore();

  const contentBody = (
    <>
      <div className="flex items-start justify-between">
        <Avatar
          size="sm"
          src={episode.scholar?.photo_url ?? undefined}
          fallback={episode.scholar?.name ?? "?"}
          alt={episode.scholar?.name ?? ""}
        />
        <span className="font-mono text-[11px] text-sand-300 tabular-nums dark:text-ink-500">
          {formatDuration(episode.duration_seconds ?? 0)}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-[13px] font-semibold text-forest-900 line-clamp-2 leading-snug dark:text-ink-100">
          {episode.title}
        </h3>
        <p className="mt-0.5 text-[11px] text-sand-300 dark:text-ink-500">
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
    </>
  );

  const actionsBody = (
    <div className="flex items-center gap-1.5 pt-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setEpisode(episode);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-500 text-white shadow-sm hover:bg-forest-600 motion-safe:transition-all motion-safe:duration-150 active:scale-90 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
        aria-label={`Play: ${episode.title}`}
      >
        <Play className="h-3.5 w-3.5 ml-0.5" fill="currentColor" />
      </button>

      {onDownload && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(episode);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-sand-300 hover:text-forest-700 hover:bg-forest-50 motion-safe:transition-all motion-safe:duration-150 active:scale-90 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-100"
          aria-label={`Download: ${episode.title}`}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  if (href) {
    return (
      <div
        className={cn(
          "flex w-[180px] shrink-0 flex-col gap-2 rounded-2xl border border-sand-200/60 bg-sand-50 p-3",
          "shadow-[0_1px_3px_rgba(15,65,38,0.04),0_4px_12px_rgba(15,65,38,0.03)]",
          "motion-safe:transition-all motion-safe:duration-150 hover:shadow-[0_4px_16px_rgba(15,65,38,0.08)] active:scale-[0.97] motion-reduce:active:scale-100",
          "dark:border-ink-700/50 dark:bg-ink-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
          className,
        )}
      >
        <Link
          href={href}
          className="flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 rounded-sm"
          aria-label={`View: ${episode.title}`}
        >
          {contentBody}
        </Link>
        {actionsBody}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-[180px] shrink-0 flex-col gap-2 rounded-2xl border border-sand-200/60 bg-sand-50 p-3",
        "shadow-[0_1px_3px_rgba(15,65,38,0.04),0_4px_12px_rgba(15,65,38,0.03)]",
        "dark:border-ink-700/50 dark:bg-ink-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      {contentBody}
      {actionsBody}
    </div>
  );
}

export function EpisodeCardSkeleton() {
  return (
    <div className="flex w-[180px] shrink-0 flex-col gap-2.5 rounded-2xl border border-sand-200/60 bg-sand-50 p-3 dark:border-ink-700/50 dark:bg-ink-900">
      <div className="flex items-start justify-between">
        <div className="h-8 w-8 rounded-full bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
        <div className="h-3 w-10 rounded-lg bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-full rounded-lg bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
        <div className="h-3 w-2/3 rounded-lg bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-5 w-12 rounded-full bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
        <div className="h-5 w-12 rounded-full bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <div className="h-9 w-9 rounded-full bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
        <WaveformSeal variant="skeleton" />
      </div>
    </div>
  );
}
