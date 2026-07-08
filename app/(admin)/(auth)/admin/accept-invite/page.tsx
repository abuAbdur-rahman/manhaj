"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const hash = window.location.hash;

      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          setSessionReady(!error);
          window.history.replaceState(null, "", window.location.pathname);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      setSessionReady(!!data.session);
    }
    init();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      if (error.status === 429) {
        toast.error("Too many attempts. Please wait a moment and try again.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Password set.");
    router.push("/admin");
  }

  if (sessionReady === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 relative h-12 w-12">
            <Image
              src="/logo.png"
              alt="Manhaj"
              fill
              className="object-contain"
              loading="eager"
            />
          </div>
          <p className="text-sm text-forest-700 dark:text-ink-100">
            Verifying your link…
          </p>
        </div>
      </div>
    );
  }

  if (sessionReady === false) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 relative h-12 w-12">
            <Image
              src="/logo.png"
              alt="Manhaj"
              fill
              className="object-contain"
              loading="eager"
            />
          </div>
          <h1 className="text-display font-semibold text-forest-900 mb-2 dark:text-ink-100">
            Link expired
          </h1>
          <p className="text-sm text-forest-700 dark:text-ink-100 mb-6">
            This invite or reset link has expired. Request a new one to
            continue.
          </p>
          <Link
            href="/admin/login"
            className="text-sm text-forest-600 underline hover:text-forest-700 dark:text-ink-500 dark:hover:text-ink-100"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/logo.png"
              alt="Manhaj"
              fill
              className="object-contain"
              loading="eager"
            />
          </div>
          <h1 className="text-display font-semibold text-forest-900 dark:text-ink-100">
            Set your password
          </h1>
          <p className="text-sm text-forest-700 dark:text-ink-100">
            This link works whether you're accepting an invite or resetting a
            forgotten password.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              New password
            </label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="confirm" className="sr-only">
              Confirm password
            </label>
            <Input
              id="confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Set password & continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
