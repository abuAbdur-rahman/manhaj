"use client";

import { useEffect, useState } from "react";
import { listDownloads } from "@/lib/downloads-db";
import { useDownloadsStore } from "@/store/downloads";

export function useDownloadedIds() {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const downloadRevision = useDownloadsStore((s) => s.downloadRevision);

  // biome-ignore lint/correctness/useExhaustiveDependencies: downloadRevision intentionally triggers IndexedDB re-fetch after writes.
  useEffect(() => {
    let cancelled = false;
    listDownloads()
      .then((items) => {
        if (!cancelled) setIds(new Set(items.map((d) => d.episode.id)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [downloadRevision]);

  return ids;
}
