"use client";

import { AudioCard } from "@/components/episodes/audio-card";
import { usePlayerStore } from "@/store/player";
import type { Episode } from "@/types";

export function RecentEpisodes({ episodes }: { episodes: Episode[] }) {
  const setEpisode = usePlayerStore((s) => s.setEpisode);

  return (
    <div className="mt-4 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
      {episodes.map((episode) => (
        <div key={episode.id} className="snap-start">
          <AudioCard
            episode={episode}
            variant="card"
            onPlay={() => setEpisode(episode)}
          />
        </div>
      ))}
    </div>
  );
}
