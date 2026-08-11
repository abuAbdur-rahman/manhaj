"use client";

import { Download, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AudioCard } from "@/components/episodes/audio-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { cancelDownload, downloadEpisode, evictDownload } from "@/lib/download";
import { invalidateDownloads } from "@/lib/query-client";
import { useDownloads } from "@/lib/use-downloaded";
import { formatBytes } from "@/lib/utils";
import { type DownloadProgress, useDownloadsStore } from "@/store/downloads";
import { usePlayerStore } from "@/store/player";

export function DownloadsContent() {
  const setEpisode = usePlayerStore((s) => s.setEpisode);
  const { data: downloads = [], isLoading, error, refetch } = useDownloads();
  const [deleteTarget, setDeleteTarget] = useState<
    (typeof downloads)[number] | null
  >(null);

  const inProgress = useDownloadsStore((s) => s.inProgress);
  const active = inProgress.filter(
    (d) => d.status === "downloading" || d.status === "saving",
  );
  const failed = inProgress.filter((d) => d.status === "error");

  const handlePlay = useCallback(
    (downloaded: (typeof downloads)[number]) => {
      setEpisode(downloaded.episode);
    },
    [setEpisode],
  );

  const handleDelete = useCallback(async () => {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);
    try {
      await evictDownload(
        target.episode.id,
        target.episode.slug,
        target.episode.audio_url,
      );
      invalidateDownloads();
    } catch (err) {
      console.error("Failed to remove download:", err);
      toast.error("Couldn't remove this download. Try again.");
    }
  }, [deleteTarget]);

  const totalBytes = downloads.reduce(
    (sum, d) => sum + (d.fileSizeBytes ?? 0),
    0,
  );

  return (
    <>
      <Header
        title="Downloads"
        actions={
          downloads.length > 0 ? (
            <span className="font-mono text-xs font-medium text-forest-500 dark:text-ink-500">
              {formatBytes(totalBytes)} used
            </span>
          ) : null
        }
      />

      <main className="flex-1 page-enter">
        <div className="mx-auto max-w-6xl px-4">
          {/* Storage usage */}
          {downloads.length > 0 && (
            <div className="flex items-center justify-between py-4">
              <p className="font-mono text-xs text-forest-500">
                {formatBytes(totalBytes)} used
              </p>
              <p className="text-xs text-sand-300">
                {downloads.length} lecture{downloads.length > 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* In-progress downloads — per-card % + progress (the global
              floating toaster mirrors this on every page). */}
          {active.length > 0 && (
            <section className="py-3">
              <h2 className="mb-2 text-sm font-semibold text-forest-700 dark:text-ink-100">
                Downloading
              </h2>
              <div className="space-y-2">
                {active.map((p) => (
                  <InProgressCard key={p.episodeId} download={p} />
                ))}
              </div>
            </section>
          )}

          {failed.length > 0 && (
            <section className="py-3">
              <h2 className="mb-2 text-sm font-semibold text-clay-600 dark:text-clay-400">
                Needs attention
              </h2>
              <div className="space-y-2">
                {failed.map((download) => (
                  <div
                    key={download.episodeId}
                    className="flex items-center gap-3 rounded-xl border border-clay-500/30 px-4 py-3"
                  >
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">
                      {download.episode.title}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void downloadEpisode(download.episode)}
                    >
                      Retry
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="space-y-1">
              {["sk-0", "sk-1", "sk-2", "sk-3", "sk-4"].map((k) => (
                <div
                  key={k}
                  className="flex items-center gap-3 rounded-xl px-3 py-3"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 motion-safe:animate-pulse rounded-lg bg-sand-200/80 dark:bg-ink-800" />
                    <div className="h-3 w-1/2 motion-safe:animate-pulse rounded-lg bg-sand-200/80 dark:bg-ink-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <p className="text-sm text-forest-700">
                Couldn't load downloads. Tap to retry.
              </p>
              <Button variant="primary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : downloads.length === 0 && active.length === 0 ? (
            <EmptyState
              title="Nothing downloaded yet"
              description="Tap the download icon on any lecture to listen without data."
              icon={<Download className="mb-4 h-10 w-10 text-sand-300" />}
            />
          ) : (
            <div className="divide-y divide-sand-200">
              {downloads.map((download) => (
                <div key={download.episode.id}>
                  {download.audioOutdated && (
                    <output className="block border-l-2 border-clay-500 bg-clay-500/10 px-3 py-2 text-xs text-clay-600 dark:text-clay-400">
                      Older audio revision – delete and download again to
                      replace it.
                    </output>
                  )}
                  <AudioCard
                    episode={download.episode}
                    variant="download"
                    onPlay={() => handlePlay(download)}
                    onDelete={() => setDeleteTarget(download)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete download?</DialogTitle>
            <DialogDescription>
              This will remove "{deleteTarget?.episode.title}" and its audio
              file from your device. You can download it again later.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InProgressCard({ download }: { download: DownloadProgress }) {
  const indeterminate = download.total === 0;
  const scholar = download.episode.scholar;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sand-200/60 bg-sand-50 px-4 py-3 shadow-sm dark:border-ink-700/50 dark:bg-ink-900">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-forest-900 line-clamp-1 dark:text-ink-100">
          {download.episode.title}
        </p>
        {scholar && (
          <p className="truncate text-xs font-medium text-forest-600 dark:text-ink-500">
            {scholar.name}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-200 dark:bg-ink-700">
            {indeterminate ? (
              <div className="h-full w-1/3 rounded-full bg-forest-500 motion-safe:animate-pulse" />
            ) : (
              <div
                className="h-full rounded-full bg-forest-500 motion-safe:transition-[width] motion-safe:duration-300 ease-out"
                style={{ width: `${download.percent}%` }}
              />
            )}
          </div>
          <span className="shrink-0 font-mono text-xs tabular-nums text-forest-500 dark:text-ink-500">
            {download.status === "saving"
              ? "Saving…"
              : indeterminate
                ? "…"
                : `${download.percent}%`}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-[10px] tabular-nums text-sand-300 dark:text-ink-500">
          {download.total > 0
            ? `${formatBytes(download.loaded)} / ${formatBytes(download.total)}`
            : formatBytes(download.loaded) || "Starting…"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => cancelDownload(download.episodeId)}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          "text-sand-300 hover:bg-sand-200/60 hover:text-forest-700 motion-safe:transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
          "dark:text-ink-500 dark:hover:bg-ink-700 dark:hover:text-ink-100",
        )}
        aria-label={`Cancel download: ${download.episode.title}`}
        title="Cancel"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
