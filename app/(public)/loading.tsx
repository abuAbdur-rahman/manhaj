import { WaveformSeal } from "@/components/ui/waveform-seal";

export default function PublicLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 dark:bg-ink-950">
      <WaveformSeal variant="muted" className="motion-safe:animate-pulse" />
    </div>
  );
}
