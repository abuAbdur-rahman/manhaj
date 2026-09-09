"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listDownloadMetadata } from "@/lib/downloads-db";

/**
 * IDs of episodes downloaded to this device. Backed by TanStack Query, so
 * it stays in sync across the search/downloads/lecture pages and refreshes
 * automatically when `invalidateDownloads()` runs after a save or delete.
 * Offline-safe: if IndexedDB can't be read the query resolves to an empty
 * set instead of erroring the UI.
 */
export function useDownloads() {
  return useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      try {
        return await listDownloadMetadata();
      } catch {
        return [];
      }
    },
    staleTime: 30_000,
    networkMode: "offlineFirst",
  });
}

export function useDownloadedIds() {
  const query = useDownloads();

  const ids = useMemo(
    () => new Set<string>((query.data ?? []).map((d) => d.episode.id)),
    [query.data],
  );
  return ids;
}
