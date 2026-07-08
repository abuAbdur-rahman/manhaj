"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
  className?: string;
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string> | undefined,
  page: number,
): string {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const pages = getPageNumbers(safePage, totalPages);
  const prevHref = buildHref(basePath, searchParams, safePage - 1);
  const nextHref = buildHref(basePath, searchParams, safePage + 1);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {safePage <= 1 ? (
        <span
          aria-disabled="true"
          className="inline-flex h-9 items-center justify-center rounded-lg px-2 text-sm text-sand-300 dark:text-ink-500"
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={prevHref}
          className="inline-flex h-9 items-center justify-center rounded-lg px-2 text-sm text-forest-700 transition-colors hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}

      {pages.map((page, i) => {
        if (page === "...") {
          const key = i < pages.length / 2 ? "ellipsis-start" : "ellipsis-end";
          return (
            <span
              key={key}
              className="inline-flex h-9 w-9 items-center justify-center text-sm text-sand-300 dark:text-ink-500"
            >
              ...
            </span>
          );
        }
        return (
          <Link
            key={page}
            href={buildHref(basePath, searchParams, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-forest-500 text-white"
                : "text-forest-700 hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800",
            )}
          >
            {page}
          </Link>
        );
      })}

      {safePage >= totalPages ? (
        <span
          aria-disabled="true"
          className="inline-flex h-9 items-center justify-center rounded-lg px-2 text-sm text-sand-300 dark:text-ink-500"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={nextHref}
          className="inline-flex h-9 items-center justify-center rounded-lg px-2 text-sm text-forest-700 transition-colors hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
