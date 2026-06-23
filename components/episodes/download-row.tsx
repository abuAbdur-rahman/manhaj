import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { formatDuration } from "@/lib/audio";
import { formatDistanceToNow } from "@/lib/utils";
import type { DownloadedEpisode } from "@/types";

interface DownloadRowProps {
  download: DownloadedEpisode;
  className?: string;
  onRemove?: (download: DownloadedEpisode) => void;
}

export function DownloadRow({
  download,
  className,
  onRemove,
}: DownloadRowProps) {
  const { episode, downloadedAt } = download;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-sand-100",
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-forest-900 truncate">
          {episode.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs text-sand-300">
            {formatDuration(episode.duration_seconds ?? 0)}
          </span>
          {episode.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="default" className="text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="mt-0.5 text-xs text-sand-300">
          Downloaded {formatDistanceToNow(new Date(downloadedAt))}
        </p>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(download)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-sand-300 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
          aria-label={`Remove download: ${episode.title}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
