"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatRetry(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.ceil(seconds / 60)} min`;
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.status === 429) {
        const data = await res.json();
        const retry = data.error?.retryAfterSeconds ?? 60;
        toast.error(`Too many attempts. Try again in ${formatRetry(retry)}.`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message ?? "Couldn't update password.");
        return;
      }

      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      toast.error("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="mx-auto max-w-md px-4 py-6 md:px-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-forest-900 dark:text-ink-100">
              Change password
            </h2>
            <div>
              <label htmlFor="current-password" className="sr-only">
                Current password
              </label>
              <Input
                id="current-password"
                type="password"
                required
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="new-password" className="sr-only">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm new password
              </label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}
