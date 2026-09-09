"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/query-client";
import { createIdbPersister } from "@/lib/query-persister";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools),
  { ssr: false },
);

const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

// Only persist serialisable server state that's useful offline (search results).
// Downloads are excluded — they're backed by IndexedDB directly and carry Blobs
// that don't serialise; they already work offline without the query cache.
export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: createIdbPersister(),
        maxAge: PERSIST_MAX_AGE,
        buster: "v1",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.queryKey[0] === "search" && query.state.status === "success",
        },
      }}
      onError={() =>
        console.error("Failed to persist/restore TanStack Query cache")
      }
    >
      {children}
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </PersistQueryClientProvider>
  );
}
