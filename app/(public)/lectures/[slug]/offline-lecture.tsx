"use client";

import { useEffect, useState } from "react";
import { getDownloadBySlug } from "@/lib/downloads-db";
import type { Episode } from "@/types";
import { LectureContent } from "./lecture-content";

export function OfflineLecture({ slug }: { slug: string }) {
  const [episode, setEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    getDownloadBySlug(slug).then((entry) => {
      if (entry) setEpisode(entry.episode);
    });
  }, [slug]);

  if (!episode) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-sm text-forest-700">
          You're offline and this lecture isn't downloaded yet.
        </p>
        <p className="mt-1 text-xs text-sand-300">
          Connect to play, or download lectures in advance from the Downloads
          tab.
        </p>
      </div>
    );
  }

  return <LectureContent episode={episode} moreEpisodes={[]} />;
}
