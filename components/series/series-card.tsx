import Image from "next/image";
import { cn } from "@/components/ui/cn";
import { formatCount } from "@/lib/utils";
import type { Series } from "@/types";

interface SeriesCardProps {
  series: Series;
  className?: string;
}

export function SeriesCard({ series, className }: SeriesCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-sand-200/60 bg-sand-50",
        "shadow-[0_1px_3px_rgba(15,65,38,0.04),0_4px_12px_rgba(15,65,38,0.03)]",
        "motion-safe:transition-all motion-safe:duration-150 hover:shadow-[0_4px_16px_rgba(15,65,38,0.08)] active:scale-[0.97] motion-reduce:active:scale-100",
        "dark:border-ink-700/50 dark:bg-ink-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:bg-ink-800",
        className,
      )}
    >
      {series.cover_url ? (
        <div className="relative h-24 w-full overflow-hidden">
          <Image
            src={series.cover_url}
            alt={series.title}
            width={320}
            height={96}
            className="h-24 w-full object-cover motion-safe:transition-transform motion-safe:duration-300 hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center bg-forest-50 dark:bg-ink-800">
          <span className="font-arabic text-2xl text-forest-100 dark:text-ink-700">
            ﷽
          </span>
        </div>
      )}

      <div className="p-3">
        <h3 className="text-[13px] font-semibold text-forest-900 line-clamp-2 leading-snug dark:text-ink-100">
          {series.title}
        </h3>
        {series.episode_count !== undefined && (
          <p className="mt-1 text-[11px] text-sand-300 dark:text-ink-500">
            {formatCount(series.episode_count, "episode")}
          </p>
        )}
      </div>
    </div>
  );
}

export function SeriesCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200/60 bg-sand-50 dark:border-ink-700/50 dark:bg-ink-900">
      <div className="h-24 bg-sand-200/60 motion-safe:animate-pulse dark:bg-ink-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-full rounded-lg bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
        <div className="h-3 w-16 rounded-lg bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
      </div>
    </div>
  );
}
