import { cn } from "@/components/ui/cn";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 motion-safe:animate-pulse rounded-lg bg-sand-200/80 dark:bg-ink-800",
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
        "motion-safe:animate-pulse rounded-lg bg-sand-200/80 dark:bg-ink-800",
        className,
      )}
    />
  );
}

export function WaveformSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-end gap-[3px] motion-safe:animate-pulse",
        className,
      )}
      aria-hidden="true"
    >
      {[4, 8, 3, 7, 5, 9, 4].map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-forest-500/20 dark:bg-ink-500/40"
          style={{ height: `${h * 2.5}px` }}
        />
      ))}
    </div>
  );
}
