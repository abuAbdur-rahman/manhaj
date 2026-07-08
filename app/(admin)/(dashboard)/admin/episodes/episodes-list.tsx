"use client";

import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDuration } from "@/lib/audio";
import type { Episode, PaginationMeta } from "@/types";

interface ScholarOption {
  id: string;
  name: string;
}

interface SeriesOption {
  id: string;
  title: string;
  scholar_id: string;
  scholar: { name: string } | null;
}

interface EpisodesListProps {
  episodes: Episode[];
  scholars: ScholarOption[];
  series: SeriesOption[];
  adminRole: "super_admin" | "scholar_admin";
  pagination: PaginationMeta;
}

type ConfirmAction = "delete" | "toggle" | null;

export function EpisodesList({
  episodes: initialEpisodes,
  scholars,
  series,
  adminRole,
  pagination,
}: EpisodesListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scholarFilter, setScholarFilter] = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState(initialEpisodes);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialEpisodes);
  }, [initialEpisodes]);
  const [actionError, setActionError] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: ConfirmAction;
  } | null>(null);

  const totalPages = Math.max(
    1,
    Math.ceil(pagination.totalCount / pagination.pageSize),
  );

  const activeSearchParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (scholarFilter !== "all") params.scholar = scholarFilter;
    if (seriesFilter !== "all") params.series = seriesFilter;
    if (statusFilter !== "all") params.status = statusFilter;
    return params;
  }, [scholarFilter, seriesFilter, statusFilter]);

  const filteredSeries = useMemo(() => {
    if (!scholarFilter || scholarFilter === "all") return series;
    return series.filter((s) => s.scholar_id === scholarFilter);
  }, [series, scholarFilter]);

  const filtered = useMemo(() => {
    let result = items;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.scholar?.name.toLowerCase().includes(q) ||
          e.series?.title.toLowerCase().includes(q),
      );
    }

    if (scholarFilter && scholarFilter !== "all") {
      result = result.filter((e) => e.scholar_id === scholarFilter);
    }

    if (seriesFilter && seriesFilter !== "all") {
      result = result.filter((e) => e.series_id === seriesFilter);
    }

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((e) =>
        statusFilter === "published" ? e.is_published : !e.is_published,
      );
    }

    return result;
  }, [items, search, scholarFilter, seriesFilter, statusFilter]);

  const handleTogglePublish = useCallback(async (episode: Episode) => {
    setActionError("");
    setPendingId(episode.id);
    try {
      const res = await fetch(`/api/admin/episodes/${episode.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !episode.is_published }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message ?? "Failed to update");
      }
      setItems((prev) =>
        prev.map((e) =>
          e.id === episode.id ? { ...e, is_published: !e.is_published } : e,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setPendingId(null);
      setConfirmAction(null);
    }
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setActionError("");
      setPendingId(id);
      try {
        const res = await fetch(`/api/admin/episodes/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message ?? "Failed to delete");
        }
        setItems((prev) => prev.filter((e) => e.id !== id));
        router.refresh();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      } finally {
        setPendingId(null);
        setConfirmAction(null);
      }
    },
    [router],
  );

  const promptConfirm = useCallback((id: string, action: ConfirmAction) => {
    setConfirmAction({ id, action });
  }, []);

  return (
    <>
      <Header
        title="Episodes"
        actions={
          <Link
            href="/admin/episodes/new"
            className={cn(
              buttonVariants({ variant: "primary", size: "sm" }),
              "gap-1.5",
            )}
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        }
      />

      <main className="flex-1 pb-20 lg:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
          {actionError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
            >
              {actionError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-300 dark:text-ink-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search episodes..."
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {adminRole === "super_admin" && (
              <Select value={scholarFilter} onValueChange={setScholarFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All scholars" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All scholars</SelectItem>
                  {scholars.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={seriesFilter} onValueChange={setSeriesFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All series</SelectItem>
                {filteredSeries.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length > 0 ? (
            <div className="mt-4 divide-y divide-sand-200 rounded-lg border border-sand-200 dark:divide-ink-700 dark:border-ink-700">
              {filtered.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sand-100 dark:hover:bg-ink-800"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-forest-900 truncate dark:text-ink-100">
                      {episode.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-forest-700 dark:text-ink-100">
                        {episode.scholar?.name}
                      </span>
                      {episode.series && (
                        <>
                          <span className="text-xs text-sand-300 dark:text-ink-500">
                            ·
                          </span>
                          <span className="text-xs text-forest-700 truncate max-w-[180px] dark:text-ink-100">
                            {episode.series.title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="font-mono text-xs text-sand-300 shrink-0 dark:text-ink-500">
                    {formatDuration(episode.duration_seconds ?? 0)}
                  </span>

                  <Badge
                    variant={episode.is_published ? "default" : "outline"}
                    className="shrink-0"
                  >
                    {episode.is_published ? "Published" : "Draft"}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pendingId === episode.id}
                    onClick={() =>
                      confirmAction?.id === episode.id &&
                      confirmAction.action === "toggle"
                        ? handleTogglePublish(episode)
                        : promptConfirm(episode.id, "toggle")
                    }
                    className="shrink-0"
                  >
                    {pendingId === episode.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : confirmAction?.id === episode.id &&
                      confirmAction.action === "toggle" ? (
                      episode.is_published ? (
                        "Unpublish?"
                      ) : (
                        "Publish?"
                      )
                    ) : episode.is_published ? (
                      "Unpublish"
                    ) : (
                      "Publish"
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pendingId === episode.id}
                    onClick={() =>
                      confirmAction?.id === episode.id &&
                      confirmAction.action === "delete"
                        ? handleDelete(episode.id)
                        : promptConfirm(episode.id, "delete")
                    }
                    className="shrink-0 text-sand-300 hover:text-red-500 dark:text-ink-500 dark:hover:text-red-400"
                    aria-label={`Delete ${episode.title}`}
                  >
                    {pendingId === episode.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : confirmAction?.id === episode.id &&
                      confirmAction.action === "delete" ? (
                      <span className="text-xs font-medium text-red-500">
                        Sure?
                      </span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title={
                  search ||
                  scholarFilter !== "all" ||
                  seriesFilter !== "all" ||
                  statusFilter !== "all"
                    ? "No matching episodes"
                    : "No episodes yet"
                }
                description={
                  search ||
                  scholarFilter !== "all" ||
                  seriesFilter !== "all" ||
                  statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Create your first episode to get started."
                }
                action={
                  !search &&
                  scholarFilter === "all" &&
                  seriesFilter === "all" &&
                  statusFilter === "all" ? (
                    <Link
                      href="/admin/episodes/new"
                      className={buttonVariants({ variant: "primary" })}
                    >
                      Create episode
                    </Link>
                  ) : undefined
                }
              />
            </div>
          )}

          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            basePath="/admin/episodes"
            searchParams={activeSearchParams}
            className="mt-6"
          />
        </div>
      </main>
    </>
  );
}
