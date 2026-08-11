"use client";

import { Check, RefreshCw, X } from "lucide-react";
import { useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { cancelDownload, downloadEpisode } from "@/lib/download";
import { formatBytes } from "@/lib/utils";
import { type DownloadProgress, useDownloadsStore } from "@/store/downloads";

const MAX_VISIBLE = 2;

export function DownloadToaster() {
  const inProgress = useDownloadsStore((s) => s.inProgress);
  const visible = inProgress.filter((d) => !d.dismissed);

  if (visible.length === 0) return null;

  const overflow = visible.length - MAX_VISIBLE;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top)+0.5rem)] z-50 flex flex-col items-center gap-2 px-2"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="flex w-full max-w-md flex-col gap-2">
        {visible.slice(0, MAX_VISIBLE).map((d) => (
          <DownloadChip key={d.episodeId} download={d} />
        ))}
        {overflow > 0 && (
          <div className="pointer-events-auto mx-auto rounded-full bg-sand-100/95 px-3 py-1 text-[11px] font-medium text-forest-600 shadow-sm backdrop-blur dark:bg-ink-800/95 dark:text-ink-100">
            +{overflow} more downloading
          </div>
        )}
      </div>
    </div>
  );
}

function DownloadChip({ download }: { download: DownloadProgress }) {
  const dismissDownload = useDownloadsStore((s) => s.dismissDownload);
  const removeDownload = useDownloadsStore((s) => s.removeDownload);

  const isError = download.status === "error";
  const isCompleted = download.status === "completed";
  const indeterminate = !isError && !isCompleted && download.total === 0;
  const scholar = download.episode.scholar;

  // Auto-dismiss terminal states so the toaster never lingers.
  useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => removeDownload(download.episodeId), 1400);
      return () => clearTimeout(t);
    }
    if (isError) return;
  }, [isCompleted, isError, download.episodeId, removeDownload]);

  const handleRetry = () => {
    void downloadEpisode(download.episode);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: card holds nested buttons; a native button would be invalid.
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-2xl border bg-sand-50/95 px-3 py-2.5 shadow-[0_4px_20px_rgba(15,65,38,0.12)] backdrop-blur-lg dark:bg-ink-900/95 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
        isError
          ? "border-clay-500/40 dark:border-clay-500/50"
          : isCompleted
            ? "border-forest-500/40 dark:border-forest-500/50"
            : "border-sand-200/80 dark:border-ink-700/60",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-300",
      )}
    >
      <Avatar
        size="sm"
        src={scholar?.photo_url ?? undefined}
        alt={scholar?.name ?? ""}
        fallback={scholar?.name ?? "?"}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-forest-900 dark:text-ink-100">
          {download.episode.title}
        </p>
        <p className="truncate text-[11px] font-medium text-forest-600 dark:text-ink-500">
          {scholar?.name ?? "Unknown scholar"}
        </p>

        {/* Progress row */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-200 dark:bg-ink-700">
            {indeterminate ? (
              <div className="h-full w-1/3 rounded-full bg-forest-500 motion-safe:animate-pulse dark:bg-forest-500" />
            ) : (
              <div
                className={cn(
                  "h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300 ease-out",
                  isError ? "bg-clay-500" : "bg-forest-500",
                )}
                style={{ width: `${download.percent}%` }}
              />
            )}
          </div>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-forest-600 dark:text-ink-500">
            {isError
              ? "Failed"
              : isCompleted
                ? "Saved"
                : download.status === "saving"
                  ? "Saving…"
                  : indeterminate
                    ? formatBytes(download.loaded) || "…"
                    : `${download.percent}%`}
          </span>
        </div>

        {/* Size readout (current / total) */}
        {!isError && !isCompleted && (
          <p className="mt-0.5 font-mono text-[10px] tabular-nums text-sand-300 dark:text-ink-500">
            {download.total > 0
              ? `${formatBytes(download.loaded)} / ${formatBytes(download.total)}`
              : formatBytes(download.loaded) || "Downloading…"}
          </p>
        )}

        {isError && download.error && (
          <p className="mt-0.5 truncate text-[10px] text-clay-600 dark:text-clay-400">
            {download.error}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {isCompleted && (
          <Check className="h-5 w-5 text-forest-500" aria-hidden="true" />
        )}
        {isError && (
          <button
            type="button"
            onClick={handleRetry}
            className="flex h-9 w-9 items-center justify-center rounded-full text-clay-600 hover:bg-clay-500/10 motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-clay-400"
            aria-label={`Retry download: ${download.episode.title}`}
            title="Retry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        {!isError && !isCompleted && (
          <button
            type="button"
            onClick={() => cancelDownload(download.episodeId)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-clay-600 hover:bg-clay-500/10 focus-visible:outline-2 focus-visible:outline-forest-500 dark:text-clay-400"
            aria-label={`Cancel download: ${download.episode.title}`}
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => dismissDownload(download.episodeId)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-sand-300 hover:bg-sand-200/60 hover:text-forest-700 motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:bg-ink-700 dark:hover:text-ink-100"
          aria-label={`Dismiss: ${download.episode.title}`}
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
