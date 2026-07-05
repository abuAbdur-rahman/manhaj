"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioCard, AudioCardSkeleton } from "@/components/episodes/audio-card";
import { Header, HeaderLeft } from "@/components/layout/header";
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

type SearchStatus = "idle" | "loading" | "error" | "done";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [results, setResults] = useState<Episode[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const lastTokenRef = useRef(0);

  const runSearch = useCallback(async (q: string, langs: Language[]) => {
    const token = ++lastTokenRef.current;

    if (!q.trim()) {
      setResults([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const episodes = await searchEpisodes(q, langs);
      if (lastTokenRef.current === token) {
        setResults(episodes);
        setStatus("done");
      }
    } catch (err) {
      if (lastTokenRef.current === token) {
        console.error("Search failed:", err);
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    runSearch(query, languages);
  }, [query, languages, runSearch]);

  const toggleLanguage = (lang: Language) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  return (
    <>
      <Header>
        <HeaderLeft type="back" label="Search" />
        <div className="flex-1 min-w-0">
          <SearchInput onSearch={setQuery} />
        </div>
      </Header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-8">
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

          {status === "idle" && (
            <EmptyState
              title="Search lectures"
              description="Search by scholar, series, or topic — try 'Aqeedah'."
            />
          )}

          {status === "loading" && (
            <div className="divide-y divide-sand-200">
              {SKELETON_KEYS.map((key) => (
                <AudioCardSkeleton key={key} />
              ))}
            </div>
          )}

          {status === "done" && results.length === 0 && (
            <EmptyState
              title="No results"
              description={`Nothing found for '${query.trim()}'. Try a scholar's name or a topic like Fiqh.`}
            />
          )}

          {status === "error" && (
            <EmptyState
              title="Search failed"
              description="Check your connection and try again."
              action={
                <Button onClick={() => runSearch(query, languages)}>
                  Try again
                </Button>
              }
            />
          )}

          {status === "done" && results.length > 0 && (
            <div className="divide-y divide-sand-200">
              {results.map((episode, i) => (
                <AudioCard key={episode.id} episode={episode} number={i + 1} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
