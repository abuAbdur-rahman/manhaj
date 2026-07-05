"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function OfflineDetector() {
  const router = useRouter();
  const pathname = usePathname();
  const [wasOffline, setWasOffline] = useState(false);

  const handleOffline = useCallback(() => {
    setWasOffline(true);
    if (pathname !== "/downloads") {
      router.replace("/downloads");
    }
  }, [pathname, router]);

  const handleOnline = useCallback(() => {
    if (wasOffline) {
      setWasOffline(false);
    }
  }, [wasOffline]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleOffline();
    }
  }, [handleOffline]);

  useEffect(() => {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [handleOffline, handleOnline]);

  return null;
}
