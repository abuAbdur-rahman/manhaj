"use client";

import { Clock, Download, Loader2, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useMemo } from "react";
import { cn } from "@/components/ui/cn";
import { formatDuration } from "@/lib/audio";
import { downloadEpisode } from "@/lib/download";
import { useDownloadedIds } from "@/lib/use-downloaded";
import { useDownloadsStore } from "@/store/downloads";
import type { Episode, Scholar } from "@/types";

type AudioCardVariant = "row" | "card" | "download";

interface AudioCardProps {
  episode: Episode;
  variant?: AudioCardVariant;
  number?: number;
  scholar?: Scholar;
  onPlay?: (episode: Episode) => void;
  onDelete?: (episode: Episode) => void;
  href?: string;
  className?: string;
}

const AudioCard = forwardRef<HTMLDivElement, AudioCardProps>(
  (
    {
      episode,
      variant = "row",
      number,
      scholar,
      onPlay,
      onDelete,
      href = `/lectures/${episode.slug}`,
      className,
    },
    ref,
  ) => {
    const router = useRouter();
    const downloadedIds = useDownloadedIds();
    const isDownloading = useDownloadsStore((s) =>
      s.inProgress.some((d) => d.episodeId === episode.id),
    );
    const isDownloaded = downloadedIds.has(episode.id);

    const getNavigationHref = useCallback(() => {
      if (
        variant === "download" &&
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        return `/offline/${episode.slug}`;
      }
      return href;
    }, [episode.slug, href, variant]);

    const durationText = useMemo(
      () => formatDuration(episode.duration_seconds ?? 0),
      [episode.duration_seconds],
    );

    const handleDownload = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDownloading || isDownloaded) return;
        await downloadEpisode(episode);
      },
      [episode, isDownloading, isDownloaded],
    );

    // ============================================
    // VARIANT: DOWNLOAD
    // ============================================
    if (variant === "download") {
      return (
        <div
          ref={ref}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-sand-100 cursor-pointer",
            className,
          )}
          onClick={() => router.push(getNavigationHref())}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push(getNavigationHref());
            }
          }}
        >
          <div className="flex flex-1 items-start gap-3 min-w-0">
            {number !== undefined && (
              <span className="shrink-0 w-6 text-right font-mono text-xs font-semibold text-forest-400 pt-0.5">
                {number}
              </span>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-forest-900 line-clamp-2 break-words">
                {episode.title}
              </h3>

              {(scholar || episode.scholar) && (
                <p className="text-xs font-medium text-forest-600 mt-0.5">
                  {(scholar || episode.scholar)?.name}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-forest-500">
                  <Clock size={12} className="flex-shrink-0" />
                  {durationText}
                </span>

                {episode.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-forest-50 text-forest-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(episode);
              }}
              disabled={isDownloading}
              className={cn(
                "p-2.5 rounded-full transition-all duration-150",
                "bg-forest-50 text-forest-600 hover:bg-forest-100",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              aria-label={`Play: ${episode.title}`}
              title="Play"
            >
              <Play size={18} fill="currentColor" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(episode);
              }}
              disabled={isDownloading}
              className={cn(
                "p-2.5 rounded-full transition-all duration-150",
                "text-forest-400 hover:text-red-600 hover:bg-red-50",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              aria-label={`Delete: ${episode.title}`}
              title="Delete download"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      );
    }

    // ============================================
    // VARIANT: CARD
    // ============================================
    if (variant === "card") {
      const cardContent = (
        <>
          <div className="flex items-center justify-between gap-2">
            {(scholar || episode.scholar) && (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  {(scholar || episode.scholar)?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-[10px] font-medium text-forest-600 truncate">
                  {(scholar || episode.scholar)?.name}
                </span>
              </div>
            )}
            <span className="font-mono text-xs text-forest-500 flex-shrink-0">
              {durationText}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-forest-900 line-clamp-2 mt-2">
            {episode.title}
          </h3>

          {episode.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {episode.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-forest-50 text-forest-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(episode);
              }}
              className={cn(
                "flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-150",
                "bg-forest-600 text-white hover:bg-forest-700",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
                "flex items-center justify-center gap-2",
              )}
              aria-label={`Play: ${episode.title}`}
            >
              <Play size={16} fill="currentColor" />
              Play
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isDownloaded}
              className={cn(
                "p-2 rounded-lg transition-all duration-150",
                isDownloaded
                  ? "text-green-600 bg-green-50"
                  : "text-forest-400 hover:text-forest-600 hover:bg-forest-50",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              aria-label={`Download: ${episode.title}`}
              title={isDownloaded ? "Downloaded" : "Download"}
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isDownloaded ? (
                <Download size={16} fill="currentColor" />
              ) : (
                <Download size={16} />
              )}
            </button>
          </div>
        </>
      );

      return (
        <div
          ref={ref}
          className={cn(
            "flex flex-col w-48 shrink-0 rounded-lg border border-sand-200 bg-white p-3 transition-all duration-150 hover:shadow-sm hover:border-forest-200",
            className,
          )}
        >
          {href ? (
            <Link
              href={href}
              className="flex flex-col gap-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 rounded-sm"
              aria-label={`View: ${episode.title}`}
            >
              {cardContent}
            </Link>
          ) : (
            cardContent
          )}
        </div>
      );
    }

    // ============================================
    // VARIANT: ROW (Default)
    // ============================================
    return (
      <div
        ref={ref}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-sand-100 cursor-pointer",
          className,
        )}
        onClick={() => {
          if (href) {
            router.push(href);
            return;
          }
          onPlay?.(episode);
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (href) {
              router.push(href);
            } else {
              onPlay?.(episode);
            }
          }
        }}
      >
        <div className="flex flex-1 items-start gap-3 min-w-0">
          {number !== undefined && (
            <span className="shrink-0 w-6 text-right font-mono text-xs font-semibold text-forest-400 pt-0.5">
              {number}
            </span>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-forest-900 line-clamp-1">
              {episode.title}
            </p>

            {(scholar || episode.scholar) && (
              <p className="text-xs font-medium text-forest-600 mt-0.5">
                {(scholar || episode.scholar)?.name}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {episode.language && (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-forest-50 text-forest-600">
                  {episode.language.slice(0, 3)}
                </span>
              )}

              {episode.tags.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-sand-100 text-forest-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs font-medium text-forest-500 whitespace-nowrap">
            {durationText}
          </span>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading || isDownloaded}
            className={cn(
              "p-2 rounded-full transition-all duration-150 flex-shrink-0",
              isDownloaded
                ? "text-green-600 bg-green-50"
                : "text-forest-400 hover:text-forest-600 hover:bg-forest-50",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            aria-label={`Download: ${episode.title}`}
            title={isDownloaded ? "Downloaded" : "Download"}
          >
            {isDownloading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isDownloaded ? (
              <Download size={18} fill="currentColor" />
            ) : (
              <Download size={18} />
            )}
          </button>
        </div>
      </div>
    );
  },
);

AudioCard.displayName = "AudioCard";

export { AudioCard };

// ============================================
// SKELETON LOADER
// ============================================
export function AudioCardSkeleton({
  variant = "row",
}: {
  variant?: AudioCardVariant;
}) {
  if (variant === "card") {
    return (
      <div className="flex flex-col w-48 shrink-0 rounded-lg border border-sand-200 bg-white p-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-full bg-sand-200" />
          <div className="h-3 w-12 rounded bg-sand-200" />
        </div>
        <div className="h-4 w-full rounded bg-sand-200 mt-3" />
        <div className="h-3 w-2/3 rounded bg-sand-200 mt-2" />
        <div className="h-10 w-full rounded-lg bg-sand-200 mt-3" />
      </div>
    );
  }

  if (variant === "download") {
    return (
      <div className="flex items-center gap-3 rounded-lg px-4 py-3 animate-pulse">
        <div className="h-4 w-6 bg-sand-200 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full bg-sand-200 rounded" />
          <div className="h-3 w-2/3 bg-sand-200 rounded" />
          <div className="h-3 w-1/3 bg-sand-200 rounded mt-1" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-sand-200 rounded-full" />
          <div className="h-10 w-10 bg-sand-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-3 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-full bg-sand-200 rounded" />
        <div className="h-3 w-2/3 bg-sand-200 rounded" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-10 bg-sand-200 rounded-full" />
          <div className="h-5 w-12 bg-sand-200 rounded-full" />
        </div>
      </div>
      <div className="h-3 w-12 bg-sand-200 rounded shrink-0" />
      <div className="h-10 w-10 bg-sand-200 rounded-full shrink-0" />
    </div>
  );
}
