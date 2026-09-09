"use client";

import { Search, X } from "lucide-react";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

export function SearchInput({
  className,
  placeholder = "Search by scholar, series, or topic — try 'Aqeedah'.",
  onSearch,
  debounceMs = 300,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(query);
      }, debounceMs);
    },
    [onSearch, debounceMs],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    debouncedSearch(next);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-300 dark:text-ink-500" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex h-11 w-full rounded-lg border border-sand-200 bg-white pl-9 pr-9 text-sm text-forest-900 placeholder:text-sand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500"
        // biome-ignore lint/a11y/noAutofocus: per design spec, search input auto-focuses on tab tap
        autoFocus
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-sand-300 hover:text-forest-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:text-ink-100"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
