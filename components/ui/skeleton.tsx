import { cn } from "@/components/ui/cn";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 animate-pulse rounded-md bg-sand-200 dark:bg-ink-800",
              i === lines - 1 ? "w-3/4" : "w-full",
              className,
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-sand-200 dark:bg-ink-800",
        className,
      )}
    />
  );
}

export function WaveformSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-end gap-0.5 motion-safe:animate-pulse",
        className,
      )}
      aria-hidden="true"
    >
      {[4, 7, 3, 6, 5].map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-forest-500/30 dark:bg-ink-500"
          style={{ height: `${h * 3}px` }}
        />
      ))}
    </div>
  );
}
