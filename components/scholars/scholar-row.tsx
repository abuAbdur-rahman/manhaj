import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import type { Scholar } from "@/types";

interface ScholarRowProps {
  scholar: Scholar;
  className?: string;
}

export function ScholarRow({ scholar, className }: ScholarRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-sand-100 dark:hover:bg-ink-800",
        className,
      )}
    >
      <Avatar
        size="md"
        src={scholar.photo_url ?? undefined}
        fallback={scholar.name}
        alt={scholar.name}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-forest-900 truncate dark:text-ink-100">
          {scholar.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {scholar.languages.map((lang) => (
            <Badge key={lang} variant="default" className="text-[11px]">
              {lang}
            </Badge>
          ))}
          {scholar.episode_count !== undefined && (
            <span className="text-xs text-sand-300 dark:text-ink-500">
              · {scholar.episode_count} lectures
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-sand-300 shrink-0 dark:text-ink-500" />
    </div>
  );
}

export function ScholarRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
      <div className="h-10 w-10 rounded-full bg-sand-200 animate-pulse shrink-0 dark:bg-ink-800" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-40 rounded bg-sand-200 animate-pulse dark:bg-ink-800" />
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-12 rounded-full bg-sand-200 animate-pulse dark:bg-ink-800" />
          <div className="h-5 w-12 rounded-full bg-sand-200 animate-pulse dark:bg-ink-800" />
        </div>
      </div>
      <div className="h-4 w-4 bg-sand-200 rounded animate-pulse shrink-0 dark:bg-ink-800" />
    </div>
  );
}
