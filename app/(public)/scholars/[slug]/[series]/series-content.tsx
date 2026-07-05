"use client";

import { Download, Play } from "lucide-react";
import { useCallback, useState } from "react";
import { AudioCard } from "@/components/episodes/audio-card";
import { Button } from "@/components/ui/button";
import { downloadEpisodeSequence } from "@/lib/download";
import { usePlayerStore } from "@/store/player";
import type { Episode } from "@/types";

interface SeriesContentProps {
  episodes: Episode[];
}

export function SeriesContent({ episodes }: SeriesContentProps) {
  const setEpisode = usePlayerStore((s) => s.setEpisode);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleDownloadAll = useCallback(async () => {
    setIsDownloadingAll(true);
    const count = await downloadEpisodeSequence(episodes);
    if (count > 0) {
      console.log(`Downloaded ${count}/${episodes.length} episodes`);
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
          <AudioCard key={episode.id} episode={episode} number={i + 1} />
        ))}
      </div>
    </div>
  );
}
