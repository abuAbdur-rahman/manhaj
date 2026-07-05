"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WaveformSeal } from "@/components/ui/waveform-seal";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Public page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand-50 px-4">
      <WaveformSeal variant="muted" className="mb-2" />
      <h1 className="text-lg font-semibold text-forest-900 text-center">
        Couldn&apos;t load this page
      </h1>
      <p className="text-sm text-forest-700 text-center max-w-xs">
        Check your connection and try again.
      </p>
      <Button variant="primary" size="sm" onClick={reset} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
