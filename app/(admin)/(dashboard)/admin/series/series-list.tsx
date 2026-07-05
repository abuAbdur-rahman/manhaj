"use client";

import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Header,
  HeaderCenter,
  HeaderLeft,
  HeaderRight,
} from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScholarOption {
  id: string;
  name: string;
}

interface SeriesRow {
  id: string;
  scholar_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  scholar: ScholarOption | null;
  episode_count: number;
}

interface SeriesListProps {
  series: SeriesRow[];
  scholars: ScholarOption[];
  adminRole: "super_admin" | "scholar_admin";
  adminScholarId: string | null;
}

type FormMode = "create" | "edit";

export function SeriesList({
  series: initialSeries,
  scholars,
  adminRole,
  adminScholarId,
}: SeriesListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scholarFilter, setScholarFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState(initialSeries);

  useEffect(() => {
    setItems(initialSeries);
  }, [initialSeries]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formScholarId, setFormScholarId] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formError, setFormError] = useState("");
  const [formPending, setFormPending] = useState(false);

  const filtered = useMemo(() => {
    let result = items;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.title.toLowerCase().includes(q));
    }

    if (scholarFilter && scholarFilter !== "all") {
      result = result.filter((s) => s.scholar_id === scholarFilter);
    }

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((s) =>
        statusFilter === "active" ? s.is_active : !s.is_active,
      );
    }

    return result;
  }, [items, search, scholarFilter, statusFilter]);

  const handleDelete = useCallback(
    async (id: string) => {
      setActionError("");
      setPendingId(id);
      try {
        const res = await fetch(`/api/admin/series/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message ?? "Failed to delete");
        }
        setItems((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_active: false } : s)),
        );
        router.refresh();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      } finally {
        setPendingId(null);
        setConfirmDelete(null);
      }
    },
    [router],
  );

  const openCreateDialog = useCallback(() => {
    setFormMode("create");
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setFormScholarId(
      adminRole === "scholar_admin" ? (adminScholarId ?? "") : "",
    );
    setFormFeatured(false);
    setFormError("");
    setDialogOpen(true);
  }, [adminRole, adminScholarId]);

  const openEditDialog = useCallback((series: SeriesRow) => {
    setFormMode("edit");
    setEditingId(series.id);
    setFormTitle(series.title);
    setFormDescription(series.description ?? "");
    setFormScholarId(series.scholar_id);
    setFormFeatured(series.is_featured);
    setFormError("");
    setDialogOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");

      if (!formTitle.trim()) {
        setFormError("Title is required");
        return;
      }

      if (
        formMode === "create" &&
        adminRole === "super_admin" &&
        !formScholarId
      ) {
        setFormError("Scholar is required");
        return;
      }

      setFormPending(true);
      try {
        if (formMode === "create") {
          const res = await fetch("/api/admin/series", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formTitle.trim(),
              description: formDescription.trim() || undefined,
              is_featured: formFeatured,
              scholar_id: formScholarId || undefined,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message ?? "Failed to create series");
          }
          const created = await res.json();
          setItems((prev) => [created, ...prev]);
        } else if (editingId) {
          const res = await fetch(`/api/admin/series/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formTitle.trim(),
              description: formDescription.trim() || null,
              is_featured: formFeatured,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message ?? "Failed to update series");
          }
          const updated = await res.json();
          setItems((prev) =>
            prev.map((s) => (s.id === editingId ? { ...s, ...updated } : s)),
          );
        }
        router.refresh();
        setDialogOpen(false);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      } finally {
        setFormPending(false);
      }
    },
    [
      formMode,
      editingId,
      formTitle,
      formDescription,
      formFeatured,
      formScholarId,
      adminRole,
      router,
    ],
  );

  return (
    <>
      <Header>
        <HeaderLeft type="logo" />
        <HeaderCenter title="Series" />
        <HeaderRight>
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={openCreateDialog}
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </HeaderRight>
      </Header>

      <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
          {actionError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {actionError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-300" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search series..."
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
          </div>

          {filtered.length > 0 ? (
            <div className="mt-4 divide-y divide-sand-200 rounded-lg border border-sand-200">
              {filtered.map((series) => (
                <div
                  key={series.id}
                  className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-sand-100 sm:flex-row sm:items-center sm:gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sand-200 text-xs font-medium text-sand-300">
                      {series.cover_url ? (
                        <Image
                          src={series.cover_url}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        series.title.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-forest-900 truncate">
                          {series.title}
                        </p>
                        {series.is_featured && (
                          <Badge
                            variant="clay"
                            className="shrink-0 text-[10px]"
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-forest-700">
                          {series.scholar?.name}
                        </span>
                        <span className="text-xs text-sand-300">·</span>
                        <span className="text-xs text-sand-300">
                          {series.episode_count} episodes
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={series.is_active ? "default" : "outline"}
                      className="shrink-0"
                    >
                      {series.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 justify-end sm:justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pendingId === series.id}
                      onClick={() => openEditDialog(series)}
                    >
                      Edit
                    </Button>

                    {series.is_active && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pendingId === series.id}
                        onClick={() =>
                          confirmDelete === series.id
                            ? handleDelete(series.id)
                            : setConfirmDelete(series.id)
                        }
                        className="shrink-0 text-sand-300 hover:text-red-500"
                        aria-label={`Delete ${series.title}`}
                      >
                        {pendingId === series.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : confirmDelete === series.id ? (
                          <span className="text-xs font-medium text-red-500">
                            Sure?
                          </span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title={
                  search || scholarFilter !== "all" || statusFilter !== "all"
                    ? "No matching series"
                    : "No series yet"
                }
                description={
                  search || scholarFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Create your first series to get started."
                }
                action={
                  !search &&
                  scholarFilter === "all" &&
                  statusFilter === "all" ? (
                    <Button variant="primary" onClick={openCreateDialog}>
                      Create series
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "New series" : "Edit series"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Create a new lecture series."
                : "Update the series details."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="series-title"
                className="text-sm font-medium text-forest-900"
              >
                Title
              </label>
              <Input
                id="series-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Series title"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="series-desc"
                className="text-sm font-medium text-forest-900"
              >
                Description
              </label>
              <Input
                id="series-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            {formMode === "create" && adminRole === "super_admin" && (
              <div className="space-y-1.5">
                <label
                  htmlFor="series-scholar"
                  className="text-sm font-medium text-forest-900"
                >
                  Scholar
                </label>
                <Select value={formScholarId} onValueChange={setFormScholarId}>
                  <SelectTrigger id="series-scholar">
                    <SelectValue placeholder="Select scholar" />
                  </SelectTrigger>
                  <SelectContent>
                    {scholars.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-forest-900">
              <input
                type="checkbox"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="rounded border-sand-300 text-forest-500 focus:ring-forest-500"
              />
              Feature this series
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={formPending}>
                {formPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : formMode === "create" ? (
                  "Create"
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
