import {
  isServer,
  QueryClient,
  type QueryClientConfig,
} from "@tanstack/react-query";

/**
 * Offline-first defaults:
 * - `networkMode: "offlineFirst"` — queries pause while offline and resume on
 *   reconnect instead of throwing, so cached data keeps rendering.
 * - short `staleTime` / `gcTime` keep the cache fresh without hammering the API.
 * - `refetchOnWindowFocus` lets a resumed PWA pull fresh data on return.
 */
const config: QueryClientConfig = {
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 0,
    },
  },
};

let browserClient: QueryClient | undefined;

/**
 * Per-request client on the server (so requests never share cache), stable
 * singleton in the browser (shared across navigation + used by lib helpers
 * such as `download.ts` for invalidation outside React).
 */
export function getQueryClient(): QueryClient {
  if (isServer) return new QueryClient(config);
  if (!browserClient) browserClient = new QueryClient(config);
  return browserClient;
}

/** Invalidate the downloads list query after a save/delete. */
export function invalidateDownloads(): void {
  if (isServer) return;
  getQueryClient().invalidateQueries({ queryKey: ["downloads"] });
}
