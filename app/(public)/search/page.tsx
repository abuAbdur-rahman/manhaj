"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useCallback, useState } from "react";
import { AudioCard, AudioCardSkeleton } from "@/components/episodes/audio-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { searchEpisodes } from "@/lib/search";
import type { Language } from "@/types";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "yoruba", label: "Yoruba" },
  { value: "english", label: "English" },
  { value: "arabic", label: "Arabic" },
];

const SKELETON_KEYS = ["s-0", "s-1", "s-2", "s-3", "s-4", "s-5"] as const;
const PAGE_SIZE = 20;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [page, setPage] = useState(1);

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ["search", query, languages, page],
    queryFn: () =>
      searchEpisodes(query, languages, { page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

  const results = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const hasMore = data?.meta.hasMore ?? false;

  const toggleLanguage = (lang: Language) => {
    setPage(1);
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const handleSearch = useCallback((nextQuery: string) => {
    setPage(1);
    setQuery(nextQuery);
  }, []);

  return (
    <>
      <Header
        title="Search"
        actions={
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-forest-700 motion-safe:transition-all motion-safe:duration-150 hover:bg-sand-100 active:scale-90 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-100 dark:hover:bg-ink-800"
            aria-label="Open search"
            aria-expanded={isSearchOpen}
          >
            <Search className="h-5 w-5" />
          </button>
        }
      />

      <main className="flex-1 page-enter">
        <div className="mx-auto max-w-6xl px-4 pb-8">
          {isSearchOpen && (
            <div className="py-3">
              <SearchInput onSearch={handleSearch} />
            </div>
          )}

          <fieldset className="m-0 flex flex-wrap gap-2 border-0 px-0 py-4">
            <legend className="sr-only">Filter by language</legend>
            {LANGUAGES.map(({ value, label }) => (
              <Chip
                key={value}
                selected={languages.includes(value)}
                onClick={() => toggleLanguage(value)}
                aria-pressed={languages.includes(value)}
              >
                {label}
              </Chip>
            ))}
          </fieldset>

          {isPending && (
            <div className="space-y-1">
              {SKELETON_KEYS.map((key) => (
                <AudioCardSkeleton key={key} />
              ))}
            </div>
          )}

          {!isPending && isError && (
            <EmptyState
              title="Search failed"
              description="Check your connection and try again."
              action={<Button onClick={() => refetch()}>Try again</Button>}
            />
          )}

          {!isPending && !isError && results.length === 0 && (
            <EmptyState
              title={query.trim() ? "No results" : "No lectures yet"}
              description={
                query.trim()
                  ? `Nothing found for '${query.trim()}'. Try a scholar's name or a topic like Fiqh.`
                  : "Published lectures will appear here."
              }
            />
          )}

          {!isPending && !isError && results.length > 0 && (
            <>
              {isFetching && (
                <p className="mb-2 text-xs text-forest-500">
                  Updating results...
                </p>
              )}
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-forest-500 dark:text-ink-500">
                  {query.trim()
                    ? `Results for '${query.trim()}'`
                    : "All lectures"}
                </p>
                <p className="font-mono text-xs text-sand-300 tabular-nums dark:text-ink-500">
                  {total} total
                </p>
              </div>
              <div className="space-y-0.5">
                {results.map((episode, i) => (
                  <AudioCard
                    key={episode.id}
                    episode={episode}
                    number={(page - 1) * PAGE_SIZE + i + 1}
                  />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <span className="font-mono text-xs text-sand-300 tabular-nums dark:text-ink-500">
                  Page {page}
                </span>
                <Button
                  variant="outline"
                  disabled={!hasMore}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
