"use client";

import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
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
import type { Language, Scholar } from "@/types";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "yoruba", label: "Yoruba" },
  { value: "english", label: "English" },
  { value: "arabic", label: "Arabic" },
];

interface ScholarsListProps {
  scholars: Scholar[];
}

export function ScholarsList({ scholars: initialScholars }: ScholarsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState(initialScholars);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formLanguages, setFormLanguages] = useState<Language[]>([]);
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formSocialWhatsapp, setFormSocialWhatsapp] = useState("");
  const [formSocialYoutube, setFormSocialYoutube] = useState("");
  const [formSocialTelegram, setFormSocialTelegram] = useState("");
  const [formSocialWebsite, setFormSocialWebsite] = useState("");
  const [formError, setFormError] = useState("");
  const [formPending, setFormPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const filtered = useMemo(() => {
    let result = items;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.bio ?? "").toLowerCase().includes(q),
      );
    }

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((s) =>
        statusFilter === "active" ? s.is_active : !s.is_active,
      );
    }

    return result;
  }, [items, search, statusFilter]);

  const handleDelete = useCallback(
    async (id: string) => {
      setActionError("");
      setPendingId(id);
      try {
        const res = await fetch(`/api/admin/scholars/${id}`, {
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

  const resetForm = useCallback(() => {
    setFormName("");
    setFormBio("");
    setFormLanguages([]);
    setFormPhotoUrl("");
    setFormSocialWhatsapp("");
    setFormSocialYoutube("");
    setFormSocialTelegram("");
    setFormSocialWebsite("");
    setFormError("");
  }, []);

  const openCreateDialog = useCallback(() => {
    setFormMode("create");
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback((scholar: Scholar) => {
    setFormMode("edit");
    setEditingId(scholar.id);
    setFormName(scholar.name);
    setFormBio(scholar.bio ?? "");
    setFormLanguages(scholar.languages);
    setFormPhotoUrl(scholar.photo_url ?? "");
    setFormSocialWhatsapp(scholar.social_links?.whatsapp ?? "");
    setFormSocialYoutube(scholar.social_links?.youtube ?? "");
    setFormSocialTelegram(scholar.social_links?.telegram ?? "");
    setFormSocialWebsite(scholar.social_links?.website ?? "");
    setFormError("");
    setDialogOpen(true);
  }, []);

  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setFormError("File must be an image");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFormError("Image exceeds 5 MB");
        return;
      }

      setPhotoUploading(true);
      setFormError("");

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message ?? "Upload failed");
        }

        const data = await res.json();
        setFormPhotoUrl(data.url);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Failed to upload photo",
        );
      } finally {
        setPhotoUploading(false);
      }
    },
    [],
  );

  const toggleLanguage = useCallback((lang: Language) => {
    setFormLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  }, []);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");

      if (!formName.trim()) {
        setFormError("Name is required");
        return;
      }

      if (photoUploading) {
        setFormError("Please wait for the photo upload to finish");
        return;
      }

      setFormPending(true);
      try {
        const payload: Record<string, unknown> = {
          name: formName.trim(),
          bio: formBio.trim() || null,
          languages: formLanguages,
          photo_url: formPhotoUrl || null,
          social_links: {
            ...(formSocialWhatsapp && { whatsapp: formSocialWhatsapp }),
            ...(formSocialYoutube && { youtube: formSocialYoutube }),
            ...(formSocialTelegram && { telegram: formSocialTelegram }),
            ...(formSocialWebsite && { website: formSocialWebsite }),
          },
        };

        if (formMode === "create") {
          const res = await fetch("/api/admin/scholars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message ?? "Failed to create scholar");
          }
          const created = await res.json();
          setItems((prev) => [created, ...prev]);
        } else if (editingId) {
          const res = await fetch(`/api/admin/scholars/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message ?? "Failed to update scholar");
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
      formName,
      formBio,
      formLanguages,
      formPhotoUrl,
      formSocialWhatsapp,
      formSocialYoutube,
      formSocialTelegram,
      formSocialWebsite,
      router,
    ],
  );

  return (
    <>
      <Header>
        <HeaderLeft type="logo" />
        <HeaderCenter title="Scholars" />
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

      <main className="flex-1 pb-20 lg:pb-0">
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
                placeholder="Search scholars..."
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
          </div>

          {filtered.length > 0 ? (
            <div className="mt-4 divide-y divide-sand-200 rounded-lg border border-sand-200">
              {filtered.map((scholar) => (
                <div
                  key={scholar.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sand-100"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sand-200 text-xs font-medium text-sand-300">
                    {scholar.photo_url ? (
                      <img
                        src={scholar.photo_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      scholar.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-forest-900 truncate">
                      {scholar.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      {scholar.languages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="default"
                          className="text-[10px]"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Badge
                    variant={scholar.is_active ? "default" : "outline"}
                    className="shrink-0"
                  >
                    {scholar.is_active ? "Active" : "Inactive"}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pendingId === scholar.id}
                    onClick={() => openEditDialog(scholar)}
                  >
                    Edit
                  </Button>

                  {scholar.is_active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pendingId === scholar.id}
                      onClick={() =>
                        confirmDelete === scholar.id
                          ? handleDelete(scholar.id)
                          : setConfirmDelete(scholar.id)
                      }
                      className="shrink-0 text-sand-300 hover:text-red-500"
                      aria-label={`Delete ${scholar.name}`}
                    >
                      {pendingId === scholar.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : confirmDelete === scholar.id ? (
                        <span className="text-xs font-medium text-red-500">
                          Sure?
                        </span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title={
                  search || statusFilter
                    ? "No matching scholars"
                    : "No scholars yet"
                }
                description={
                  search || statusFilter
                    ? "Try adjusting your search or filters."
                    : "Create your first scholar to get started."
                }
                action={
                  !search && !statusFilter ? (
                    <Button variant="primary" onClick={openCreateDialog}>
                      Create scholar
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "New scholar" : "Edit scholar"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Add a new scholar to the platform."
                : "Update the scholar's details."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-forest-900">
                Name
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Scholar name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-forest-900">Bio</label>
              <Input
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="Short biography"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-forest-900">
                Languages
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => toggleLanguage(lang.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      formLanguages.includes(lang.value)
                        ? "bg-forest-100 text-forest-700"
                        : "bg-sand-100 text-sand-300 hover:bg-sand-200"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-forest-900">
                Photo
              </label>
              <div className="flex items-center gap-3">
                {formPhotoUrl && (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-sand-200">
                    <img
                      src={formPhotoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload photo"
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  aria-label="Upload scholar photo"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-forest-900">
                Social links
              </label>
              <div className="space-y-2">
                <Input
                  value={formSocialWhatsapp}
                  onChange={(e) => setFormSocialWhatsapp(e.target.value)}
                  placeholder="WhatsApp link"
                />
                <Input
                  value={formSocialYoutube}
                  onChange={(e) => setFormSocialYoutube(e.target.value)}
                  placeholder="YouTube link"
                />
                <Input
                  value={formSocialTelegram}
                  onChange={(e) => setFormSocialTelegram(e.target.value)}
                  placeholder="Telegram link"
                />
                <Input
                  value={formSocialWebsite}
                  onChange={(e) => setFormSocialWebsite(e.target.value)}
                  placeholder="Website link"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={formPending || photoUploading}
              >
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
