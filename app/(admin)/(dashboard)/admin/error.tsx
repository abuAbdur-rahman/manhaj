"use client";

import { Button } from "@/components/ui/button";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Admin Dashboard error:", error);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-center md:px-6">
      <p className="text-body text-forest-700">
        Couldn&apos;t load dashboard. Tap to retry.
      </p>
      <Button variant="primary" className="mt-4" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
