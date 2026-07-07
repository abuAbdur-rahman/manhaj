"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function OfflineDetector() {
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);
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
  }, []);

  useEffect(() => {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [handleOffline, handleOnline]);

  if (!offline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-forest-900 text-sm px-4 py-2 text-center font-medium"
      role="alert"
    >
      You&apos;re offline — showing downloaded content
    </div>
  );
}
