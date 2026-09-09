"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AudioCard, AudioCardSkeleton } from "@/components/episodes/audio-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { searchEpisodes } from "@/lib/search";
import type { Episode, Language } from "@/types";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "yoruba", label: "Yoruba" },
  { value: "english", label: "English" },
  { value: "arabic", label: "Arabic" },
];

const SKELETON_KEYS = ["s-0", "s-1", "s-2", "s-3", "s-4", "s-5"] as const;
const PAGE_SIZE = 20;

type SearchStatus = "idle" | "loading" | "error" | "done";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [results, setResults] = useState<Episode[]>([]);
  const [status, setStatus] = useState<SearchStatus>("loading");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const lastTokenRef = useRef(0);

  const runSearch = useCallback(
    async (q: string, langs: Language[], nextPage: number) => {
      const token = ++lastTokenRef.current;

      setStatus("loading");
      try {
        const result = await searchEpisodes(q, langs, {
          page: nextPage,
          pageSize: PAGE_SIZE,
        });
        if (lastTokenRef.current === token) {
          setResults(result.data);
          setTotal(result.meta.total);
          setHasMore(result.meta.hasMore);
          setStatus("done");
        }
      } catch (err) {
        if (lastTokenRef.current === token) {
          console.error("Search failed:", err);
          setStatus("error");
        }
      }
    },
    [],
  );

  useEffect(() => {
    runSearch(query, languages, page);
  }, [query, languages, page, runSearch]);

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
            className="flex h-11 w-11 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-100 dark:hover:bg-ink-800"
            aria-label="Open search"
            aria-expanded={isSearchOpen}
          >
            <Search className="h-5 w-5" />
          </button>
        }
      />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-8">
          {isSearchOpen && (
            <div className="py-3">
              <SearchInput onSearch={handleSearch} />
            </div>
          )}

          <fieldset className="m-0 flex flex-wrap gap-2 border-0 px-0 py-3">
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

          {status === "loading" && (
            <div className="divide-y divide-sand-200 dark:divide-ink-700">
              {SKELETON_KEYS.map((key) => (
                <AudioCardSkeleton key={key} />
              ))}
            </div>
          )}

          {status === "done" && results.length === 0 && (
            <EmptyState
              title={query.trim() ? "No results" : "No lectures yet"}
              description={
                query.trim()
                  ? `Nothing found for '${query.trim()}'. Try a scholar's name or a topic like Fiqh.`
                  : "Published lectures will appear here."
              }
            />
          )}

          {status === "error" && (
            <EmptyState
              title="Search failed"
              description="Check your connection and try again."
              action={
                <Button onClick={() => runSearch(query, languages, page)}>
                  Try again
                </Button>
              }
            />
          )}

          {status === "done" && results.length > 0 && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-forest-500 dark:text-ink-500">
                  {query.trim()
                    ? `Results for '${query.trim()}'`
                    : "All lectures"}
                </p>
                <p className="font-mono text-xs text-sand-300 dark:text-ink-500">
                  {total} total
                </p>
              </div>
              <div className="divide-y divide-sand-200 dark:divide-ink-700">
                {results.map((episode, i) => (
                  <AudioCard
                    key={episode.id}
                    episode={episode}
                    number={(page - 1) * PAGE_SIZE + i + 1}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <span className="font-mono text-xs text-forest-500 dark:text-ink-500">
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
