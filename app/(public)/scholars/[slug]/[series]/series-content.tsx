"use client";

import { Download, Play } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { EpisodeRow } from "@/components/episodes/episode-row";
import { Button } from "@/components/ui/button";
import { downloadEpisode } from "@/lib/download";
import { usePlayerStore } from "@/store/player";
import type { Episode } from "@/types";

interface SeriesContentProps {
  episodes: Episode[];
}

export function SeriesContent({ episodes }: SeriesContentProps) {
  const setEpisode = usePlayerStore((s) => s.setEpisode);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleDownload = useCallback(async (episode: Episode) => {
    setDownloadingIds((prev) => new Set(prev).add(episode.id));
    try {
      await downloadEpisode(episode);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(
        `Couldn't download "${episode.title}". Check your connection and storage space.`,
      );
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(episode.id);
        return next;
      });
    }
  }, []);

  const handleDownloadAll = useCallback(async () => {
    setIsDownloadingAll(true);
    for (const episode of episodes) {
      setDownloadingIds((prev) => new Set(prev).add(episode.id));
      try {
        await downloadEpisode(episode);
      } catch (err) {
        console.error("Download failed:", err);
        toast.error(
          `Couldn't download "${episode.title}". Check your connection and storage space.`,
        );
      }
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(episode.id);
        return next;
      });
    }
    setIsDownloadingAll(false);
  }, [episodes]);

  const handlePlayAll = useCallback(() => {
    if (episodes.length > 0) {
      setEpisode(episodes[0]);
    }
  }, [episodes, setEpisode]);

  if (episodes.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-sand-300">No episodes in this series yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-4">
        <Button onClick={handlePlayAll} className="flex-1 gap-2">
          <Play className="h-4 w-4" />
          Play all
        </Button>
        <Button
          variant="secondary"
          onClick={handleDownloadAll}
          disabled={isDownloadingAll}
          className="flex-1 gap-2"
        >
          <Download className="h-4 w-4" />
          Download all
        </Button>
      </div>

      <div className="divide-y divide-sand-200">
        {episodes.map((episode, i) => (
          <EpisodeRow
            key={episode.id}
            episode={episode}
            index={i + 1}
            onDownload={
              downloadingIds.has(episode.id) ? undefined : handleDownload
            }
          />
        ))}
      </div>
    </div>
  );
}
