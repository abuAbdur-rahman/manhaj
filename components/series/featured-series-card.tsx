import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { formatCount } from "@/lib/utils";
import type { Series } from "@/types";

interface FeaturedSeriesCardProps {
  series: Series;
  className?: string;
}

export function FeaturedSeriesCard({
  series,
  className,
}: FeaturedSeriesCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-sand-200/60 bg-sand-50",
        "shadow-[0_2px_8px_rgba(15,65,38,0.04),0_8px_24px_rgba(15,65,38,0.06)]",
        "motion-safe:transition-all motion-safe:duration-200 hover:shadow-[0_8px_32px_rgba(15,65,38,0.10)] active:scale-[0.98] motion-reduce:active:scale-100",
        "dark:border-ink-700/50 dark:bg-ink-900 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      {series.cover_url ? (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={series.cover_url}
            alt={series.title}
            width={640}
            height={160}
            className="h-40 w-full object-cover motion-safe:transition-transform motion-safe:duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center bg-forest-50 dark:bg-ink-800">
          <span className="font-arabic text-4xl text-forest-100 dark:text-ink-700">
            ﷽
          </span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-base font-bold text-forest-900 dark:text-ink-100">
          {series.title}
        </h3>
        <div className="mt-2.5 flex items-center gap-2">
          {series.scholar && (
            <>
              <Avatar
                size="sm"
                src={series.scholar.photo_url}
                fallback={series.scholar.name}
                alt=""
              />
              <span className="text-sm font-medium text-forest-700 dark:text-ink-100">
                {series.scholar.name}
              </span>
            </>
          )}
          {series.episode_count !== undefined && (
            <span className="text-xs text-sand-300 dark:text-ink-500">
              · {formatCount(series.episode_count, "episode")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedSeriesCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200/60 bg-sand-50 dark:border-ink-700/50 dark:bg-ink-900">
      <div className="h-40 bg-sand-200/60 motion-safe:animate-pulse dark:bg-ink-800" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded-lg bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
          <div className="h-4 w-32 rounded-lg bg-sand-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
        </div>
      </div>
    </div>
  );
}
