"use client";

import Link from "next/link";
import { EpisodeRow } from "@/components/episodes/episode-row";
import { SeriesCard } from "@/components/series/series-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Episode, Series } from "@/types";

interface ScholarTabsProps {
  series: Series[];
  episodes: Episode[];
}

export function ScholarTabs({ series, episodes }: ScholarTabsProps) {
  return (
    <Tabs defaultValue="series">
      <TabsList className="w-full">
        <TabsTrigger value="series" className="flex-1">
          Series{series.length > 0 && ` (${series.length})`}
        </TabsTrigger>
        <TabsTrigger value="episodes" className="flex-1">
          All Episodes{episodes.length > 0 && ` (${episodes.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="series">
        {series.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {series.map((s) => (
              <Link key={s.id} href={`/scholars/${s.scholar?.slug}/${s.slug}`}>
                <SeriesCard series={s} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-sand-300">
            No series yet. Check back soon.
          </p>
        )}
      </TabsContent>

      <TabsContent value="episodes">
        {episodes.length > 0 ? (
          <div className="divide-y divide-sand-200">
            {episodes.map((episode, i) => (
              <EpisodeRow key={episode.id} episode={episode} index={i + 1} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-sand-300">
            No episodes yet. Check back soon.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
