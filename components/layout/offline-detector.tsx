"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "manhaj-offline-banner-dismissed";

export function OfflineDetector() {
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!mounted || !offline) return;

    if (pathname.startsWith("/offline/") || pathname === "/downloads") {
      return;
    }

    if (
      pathname.startsWith("/lectures/") &&
      !pathname.startsWith("/offline/")
    ) {
      window.location.href = pathname.replace("/lectures/", "/offline/");
    } else {
      window.location.href = "/downloads";
    }
  }, [mounted, offline, pathname]);

  const handleOffline = useCallback(() => {
    setOffline(true);
    setDismissed(false);
    sessionStorage.removeItem(DISMISS_KEY);
    if (pathname.startsWith("/offline/") || pathname === "/downloads") {
      return;
    }
    if (
      pathname.startsWith("/lectures/") &&
      !pathname.startsWith("/offline/")
    ) {
      window.location.href = pathname.replace("/lectures/", "/offline/");
    } else {
      window.location.href = "/downloads";
    }
  }, [pathname]);

  const handleOnline = useCallback(() => {
    setOffline(false);
    setDismissed(false);
    sessionStorage.removeItem(DISMISS_KEY);
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }, []);

  useEffect(() => {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [handleOffline, handleOnline]);

  if (!offline || dismissed) return null;

  return (
    <div
      className="fixed top-[calc(3.5rem+env(safe-area-inset-top))] left-0 right-0 z-50 flex items-center justify-between gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-forest-900"
      role="alert"
    >
      <p>You&apos;re offline — showing downloaded content</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss offline banner"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
