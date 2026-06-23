import Image from "next/image";
import { cn } from "@/components/ui/cn";
import type { Series } from "@/types";

interface SeriesCardProps {
  series: Series;
  className?: string;
}

export function SeriesCard({ series, className }: SeriesCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-sand-200 bg-sand-100 transition-colors hover:bg-sand-50",
        className,
      )}
    >
      {series.cover_url ? (
        <Image
          src={series.cover_url}
          alt={series.title}
          width={320}
          height={96}
          className="h-24 w-full object-cover"
        />
      ) : (
        <div className="flex h-24 items-center justify-center bg-forest-50">
          <span className="font-arabic text-2xl text-forest-100">﷽</span>
        </div>
      )}

      <div className="p-2.5">
        <h3 className="text-sm font-semibold text-forest-900 line-clamp-2">
          {series.title}
        </h3>
        {series.episode_count !== undefined && (
          <p className="mt-1 text-xs text-sand-300">
            {series.episode_count} episodes
          </p>
        )}
      </div>
    </div>
  );
}

export function SeriesCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
      <div className="h-24 bg-sand-200 animate-pulse" />
      <div className="p-2.5 space-y-2">
        <div className="h-4 w-full rounded bg-sand-200 animate-pulse" />
        <div className="h-3 w-16 rounded bg-sand-200 animate-pulse" />
      </div>
    </div>
  );
}
