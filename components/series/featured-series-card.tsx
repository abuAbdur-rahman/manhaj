import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
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
        "relative overflow-hidden rounded-xl border border-sand-200 bg-sand-100 dark:border-ink-700 dark:bg-ink-900",
        className,
      )}
    >
      {series.cover_url ? (
        <Image
          src={series.cover_url}
          alt={series.title}
          width={640}
          height={160}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-forest-50 dark:bg-ink-800">
          <span className="font-arabic text-4xl text-forest-100 dark:text-ink-700">
            ﷽
          </span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-forest-900 dark:text-ink-100">
          {series.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {series.scholar && (
            <>
              <Avatar
                size="sm"
                src={series.scholar.photo_url}
                fallback={series.scholar.name}
                alt={series.scholar.name}
              />
              <span className="text-sm text-forest-700 dark:text-ink-100">
                {series.scholar.name}
              </span>
            </>
          )}
          {series.episode_count !== undefined && (
            <span className="text-sm text-sand-300 dark:text-ink-500">
              · {series.episode_count} episodes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedSeriesCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-sand-200 bg-sand-100 dark:border-ink-700 dark:bg-ink-900">
      <div className="h-40 bg-sand-200 animate-pulse dark:bg-ink-800" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-3/4 rounded bg-sand-200 animate-pulse dark:bg-ink-800" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sand-200 animate-pulse dark:bg-ink-800" />
          <div className="h-4 w-32 rounded bg-sand-200 animate-pulse dark:bg-ink-800" />
        </div>
      </div>
    </div>
  );
}
