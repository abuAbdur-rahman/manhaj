"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DownloadRow } from "@/components/episodes/download-row";
import { Header, HeaderCenter, HeaderLeft } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listDownloads, removeDownload } from "@/lib/downloads-db";
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

  const handlePlay = useCallback(
    (download: DownloadedEpisode) => {
      setEpisode(download.episode);
    },
    [setEpisode],
  );

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
  }, []);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const handleRemove = useCallback(async (download: DownloadedEpisode) => {
    try {
      await removeDownload(download.episode.id);
      setDownloads((prev) =>
        prev.filter((d) => d.episode.id !== download.episode.id),
      );
    } catch (err) {
      console.error("Failed to remove download:", err);
      toast.error("Couldn't remove this download. Try again.");
    }
  }, []);

  const totalBytes = downloads.reduce(
    (sum, d) => sum + (d.fileSizeBytes ?? 0),
    0,
  );

  return (
    <>
      <Header>
        <HeaderLeft type="back" label="Downloads" />
        <HeaderCenter title="Downloads" />
      </Header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4">
          {downloads.length > 0 && (
            <div className="flex items-center justify-between py-4">
              <p className="font-mono text-xs text-sand-300">
                {formatBytes(totalBytes)} used
              </p>
              <p className="text-xs text-sand-300">
                {downloads.length} lecture{downloads.length > 1 ? "s" : ""}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <no explanation>
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-sand-200" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-10 animate-pulse rounded bg-sand-200" />
                      <div className="h-5 w-12 animate-pulse rounded-full bg-sand-200" />
                    </div>
                    <div className="h-3 w-24 animate-pulse rounded bg-sand-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <p className="text-sm text-forest-700">{error}</p>
              <Button variant="primary" size="sm" onClick={loadDownloads}>
                Retry
              </Button>
            </div>
          ) : downloads.length === 0 ? (
            <EmptyState
              title="Nothing downloaded yet"
              description="Tap the download icon on any lecture to listen without data."
              icon={<Download className="mb-4 h-10 w-10 text-sand-300" />}
            />
          ) : (
            <div className="divide-y divide-sand-200">
              {downloads.map((download) => (
                <DownloadRow
                  key={download.episode.id}
                  download={download}
                  onPlay={handlePlay}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
