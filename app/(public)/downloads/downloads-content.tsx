"use client";

import { Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AudioCard } from "@/components/episodes/audio-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { listDownloads, removeDownload } from "@/lib/downloads-db";
import { useDownloadsStore } from "@/store/downloads";
import { usePlayerStore } from "@/store/player";
import type { DownloadedEpisode } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function DownloadsContent() {
  const setEpisode = usePlayerStore((s) => s.setEpisode);
  const [downloads, setDownloads] = useState<DownloadedEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DownloadedEpisode | null>(
    null,
  );

  const inProgress = useDownloadsStore((s) => s.inProgress);
  const downloadRevision = useDownloadsStore((s) => s.downloadRevision);

  const handlePlay = useCallback(
    (downloaded: DownloadedEpisode) => {
      setEpisode(downloaded.episode);
    },
    [setEpisode],
  );

  const handleDelete = useCallback(async () => {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);
    try {
      await removeDownload(target.episode.id);
      setDownloads((prev) =>
        prev.filter((d) => d.episode.id !== target.episode.id),
      );
    } catch (err) {
      console.error("Failed to remove download:", err);
      toast.error("Couldn't remove this download. Try again.");
    }
  }, [deleteTarget]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reactivity trigger — re-fetch on download completion
  const loadDownloads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await listDownloads();
      setDownloads(items);
    } catch {
      setError("Couldn't load downloads. Tap to retry.");
    } finally {
      setIsLoading(false);
    }
  }, [downloadRevision]);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

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

      <main className="flex-1">
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

          {/* In-progress downloads */}
          {inProgress.length > 0 && (
            <section className="py-2">
              <h2 className="mb-2 text-sm font-semibold text-forest-700">
                Downloading
              </h2>
              <div className="divide-y divide-sand-200 rounded-lg border border-sand-200 bg-sand-100">
                {inProgress.map((p) => (
                  <div
                    key={p.episodeId}
                    className="flex items-center gap-3 px-3 py-3"
                  >
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-forest-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-forest-900">
                        {p.episode.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-200">
                          <div
                            className="h-full rounded-full bg-forest-500 transition-all duration-300"
                            style={{ width: `${p.percent}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-forest-500 shrink-0">
                          {p.status === "saving"
                            ? "Saving..."
                            : p.status === "error"
                              ? "Failed"
                              : `${p.percent}%`}
                        </span>
                      </div>
                    </div>
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-sand-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-sand-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className="flex flex-col items-center gap-4 py-16">
              <p className="text-sm text-forest-700">{error}</p>
              <Button variant="primary" size="sm" onClick={loadDownloads}>
                Retry
              </Button>
            </div>
          ) : downloads.length === 0 && inProgress.length === 0 ? (
            /* Empty state */
            <EmptyState
              title="Nothing downloaded yet"
              description="Tap the download icon on any lecture to listen without data."
              icon={<Download className="mb-4 h-10 w-10 text-sand-300" />}
            />
          ) : (
            /* Completed downloads */
            <div className="divide-y divide-sand-200">
              {downloads.map((download) => (
                <AudioCard
                  key={download.episode.id}
                  episode={download.episode}
                  variant="download"
                  onPlay={() => handlePlay(download)}
                  onDelete={() => setDeleteTarget(download)}
                />
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
