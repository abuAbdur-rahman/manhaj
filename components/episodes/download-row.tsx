"use client";

import { Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDuration } from "@/lib/audio";
import { formatDistanceToNow } from "@/lib/utils";
import type { DownloadedEpisode } from "@/types";

interface DownloadRowProps {
  download: DownloadedEpisode;
  className?: string;
  onPlay?: (download: DownloadedEpisode) => void;
  onRemove?: (download: DownloadedEpisode) => void;
}

export function DownloadRow({
  download,
  className,
  onPlay,
  onRemove,
}: DownloadRowProps) {
  const { episode, downloadedAt } = download;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    // biome-ignore lint/a11y/useSemanticElements: nested interactive children (play/delete buttons) prevent use of <button>
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPlay?.(download)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay?.(download);
        }
      }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-sand-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:hover:bg-ink-800",
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-forest-900 truncate dark:text-ink-100">
          {episode.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs text-sand-300 dark:text-ink-500">
            {formatDuration(episode.duration_seconds ?? 0)}
          </span>
          {episode.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="default" className="text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="mt-0.5 text-xs text-sand-300 dark:text-ink-500">
          Downloaded {formatDistanceToNow(new Date(downloadedAt))}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(download);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full text-forest-500 hover:bg-forest-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-100 dark:hover:bg-ink-800"
          aria-label={`Play: ${episode.title}`}
        >
          <Play className="h-5 w-5" />
        </button>

        {onRemove && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="flex h-11 w-11 items-center justify-center rounded-full text-sand-300 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                aria-label={`Remove download: ${episode.title}`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove download?</DialogTitle>
                <DialogDescription>
                  This will delete the lecture from your device. You can
                  download it again later.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setDialogOpen(false);
                    onRemove(download);
                  }}
                >
                  Remove
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
