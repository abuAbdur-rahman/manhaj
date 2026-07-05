"use client";

import { Loader2, Plus, Search, Trash2 } from "lucide-react";
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
import type { Admin } from "@/types";

interface AdminWithScholar extends Admin {
  scholar?: { id: string; name: string } | null;
}

interface AdminListProps {
  admins: AdminWithScholar[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminsList({ admins: initialAdmins }: AdminListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState(initialAdmins);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [formPending, setFormPending] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"super_admin" | "scholar_admin">(
    "scholar_admin",
  );
  const [formScholarId, setFormScholarId] = useState("");

  useEffect(() => {
    setItems(initialAdmins);
  }, [initialAdmins]);

  const filtered = useMemo(() => {
    let result = items;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
      );
    }

    if (roleFilter && roleFilter !== "all") {
      result = result.filter((a) => a.role === roleFilter);
    }

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((a) =>
        statusFilter === "active" ? a.is_active : !a.is_active,
      );
    }

    return result;
  }, [items, search, roleFilter, statusFilter]);

  const handleDeactivate = useCallback(
    async (id: string) => {
      setActionError("");
      setPendingId(id);
      try {
        const res = await fetch(`/api/admin/admins/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message ?? "Failed to deactivate");
        }
        setItems((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_active: false } : a)),
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
    setFormEmail("");
    setFormRole("scholar_admin");
    setFormScholarId("");
    setFormError("");
    setInviteResult(null);
  }, []);

  const openInviteDialog = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");
      setInviteResult(null);

      if (!formName.trim()) {
        setFormError("Name is required");
        return;
      }

      if (!formEmail.trim()) {
        setFormError("Email is required");
        return;
      }

      if (formRole === "scholar_admin" && !formScholarId) {
        setFormError("Scholar is required for scholar admin role");
        return;
      }

      setFormPending(true);
      try {
        const res = await fetch("/api/admin/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            email: formEmail.trim(),
            role: formRole,
            scholar_id: formRole === "scholar_admin" ? formScholarId : null,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message ?? "Failed to invite admin");
        }

        const data = await res.json();
        setItems((prev) => [data, ...prev]);
        setInviteResult({
          email: formEmail.trim(),
          password: data.tempPassword,
        });
        router.refresh();
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      } finally {
        setFormPending(false);
      }
    },
    [formName, formEmail, formRole, formScholarId, router],
  );

  return (
    <>
      <Header>
        <HeaderLeft type="logo" />
        <HeaderCenter title="Admins" />
        <HeaderRight>
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={openInviteDialog}
          >
            <Plus className="h-4 w-4" />
            Invite
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
                placeholder="Search admins..."
                className="pl-9"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="super_admin">Super admin</SelectItem>
                <SelectItem value="scholar_admin">Scholar admin</SelectItem>
              </SelectContent>
            </Select>

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
              {filtered.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sand-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-forest-900 truncate">
                        {admin.name}
                      </p>
                      {admin.id === initialAdmins[0]?.id && (
                        <span className="text-[10px] text-sand-300">(you)</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-forest-700">
                        {admin.email}
                      </span>
                      {admin.scholar && (
                        <>
                          <span className="text-xs text-sand-300">·</span>
                          <span className="text-xs text-forest-700">
                            {admin.scholar.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={admin.role === "super_admin" ? "clay" : "default"}
                    className="shrink-0 text-[10px]"
                  >
                    {admin.role === "super_admin" ? "Super" : "Scholar"}
                  </Badge>

                  <Badge
                    variant={admin.is_active ? "default" : "outline"}
                    className="shrink-0"
                  >
                    {admin.is_active ? "Active" : "Inactive"}
                  </Badge>

                  <span className="font-mono text-[10px] text-sand-300 shrink-0">
                    {formatDate(admin.created_at)}
                  </span>

                  {admin.is_active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pendingId === admin.id}
                      onClick={() =>
                        confirmDelete === admin.id
                          ? handleDeactivate(admin.id)
                          : setConfirmDelete(admin.id)
                      }
                      className="shrink-0 text-sand-300 hover:text-red-500"
                      aria-label={`Deactivate ${admin.name}`}
                    >
                      {pendingId === admin.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : confirmDelete === admin.id ? (
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
                  search || roleFilter !== "all" || statusFilter !== "all"
                    ? "No matching admins"
                    : "No admins yet"
                }
                description={
                  search || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Invite your first admin to get started."
                }
                action={
                  !search && roleFilter === "all" && statusFilter === "all" ? (
                    <Button variant="primary" onClick={openInviteDialog}>
                      Invite admin
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setInviteResult(null);
          setDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {inviteResult ? (
            <>
              <DialogHeader>
                <DialogTitle>Admin invited</DialogTitle>
                <DialogDescription>
                  Share these credentials securely with the new admin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 rounded-lg border border-sand-200 bg-sand-100 p-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-sand-300">Email</p>
                  <p className="text-sm text-forest-900">
                    {inviteResult.email}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-sand-300">
                    Temporary password
                  </p>
                  <p className="font-mono text-sm text-forest-900 break-all">
                    {inviteResult.password}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    setDialogOpen(false);
                    setInviteResult(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Invite admin</DialogTitle>
                <DialogDescription>
                  Create a new admin account. A temporary password will be
                  generated.
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
                    placeholder="Admin name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-forest-900">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-forest-900">
                    Role
                  </label>
                  <Select
                    value={formRole}
                    onValueChange={(v) =>
                      setFormRole(v as "super_admin" | "scholar_admin")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super admin</SelectItem>
                      <SelectItem value="scholar_admin">
                        Scholar admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formRole === "scholar_admin" && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-900">
                      Scholar
                    </label>
                    <Input
                      value={formScholarId}
                      onChange={(e) => setFormScholarId(e.target.value)}
                      placeholder="Scholar ID"
                    />
                    <p className="text-xs text-sand-300">
                      Enter the scholar's UUID this admin will manage.
                    </p>
                  </div>
                )}

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
                    disabled={formPending}
                  >
                    {formPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      "Invite"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
