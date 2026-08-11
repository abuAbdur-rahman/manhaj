"use client";

import { Clock, ListMusic, SkipBack, SkipForward } from "lucide-react";
import { PlayButton } from "@/components/player/play-button";
import { Scrubber } from "@/components/player/scrubber";
import { cn } from "@/components/ui/cn";
import { formatDuration } from "@/lib/audio";
import type { Speed } from "@/types";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  speed: Speed;
  sleepTimerRemaining: number | null;
  onPlay: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSpeedChange: (speed: Speed) => void;
  onSleepTimer: () => void;
  className?: string;
}

const speeds: Speed[] = [0.75, 1, 1.25, 1.5, 2];

export function PlayerControls({
  isPlaying,
  isLoading,
  currentTime,
  duration,
  speed,
  sleepTimerRemaining,
  onPlay,
  onSeek,
  onSkipBack,
  onSkipForward,
  onPrevious,
  onNext,
  onSpeedChange,
  onSleepTimer,
  className,
}: PlayerControlsProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="px-2">
        <Scrubber
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </div>

      <div className="flex items-center justify-between px-4">
        <span className="font-mono text-xs text-sand-300 w-12 text-right tabular-nums dark:text-ink-500">
          {formatDuration(currentTime)}
        </span>
        <span className="font-mono text-xs text-sand-300 w-12 tabular-nums dark:text-ink-500">
          {formatDuration(duration)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-8">
        {onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            className="flex h-12 w-12 items-center justify-center rounded-full text-forest-700 hover:bg-forest-50 focus-visible:outline-2 focus-visible:outline-forest-500 dark:text-ink-100 dark:hover:bg-ink-800"
            aria-label="Previous episode"
          >
            <ListMusic className="h-5 w-5" />
          </button>
        )}

        <button
          type="button"
          onClick={onSkipBack}
          className="flex h-12 w-12 items-center justify-center rounded-full text-forest-700 hover:bg-forest-50 motion-safe:transition-all motion-safe:duration-150 active:scale-90 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-100 dark:hover:bg-ink-800"
          aria-label="Skip back 10 seconds"
        >
          <SkipBack className="h-6 w-6" />
        </button>

        <PlayButton
          isPlaying={isPlaying}
          isLoading={isLoading}
          size="lg"
          onClick={onPlay}
        />

        <button
          type="button"
          onClick={onSkipForward}
          className="flex h-12 w-12 items-center justify-center rounded-full text-forest-700 hover:bg-forest-50 motion-safe:transition-all motion-safe:duration-150 active:scale-90 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-100 dark:hover:bg-ink-800"
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="h-6 w-6" />
        </button>

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex h-12 w-12 items-center justify-center rounded-full text-forest-700 hover:bg-forest-50 focus-visible:outline-2 focus-visible:outline-forest-500 dark:text-ink-100 dark:hover:bg-ink-800"
            aria-label="Next episode"
          >
            <ListMusic className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pt-2">
        <div className="flex items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={cn(
                "flex h-9 w-11 items-center justify-center rounded-lg text-xs font-semibold",
                "motion-safe:transition-all motion-safe:duration-150 active:scale-90 motion-reduce:active:scale-100",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
                s === speed
                  ? "bg-forest-100 text-forest-700 shadow-sm dark:bg-ink-800 dark:text-ink-100"
                  : "text-sand-300 hover:text-forest-700 hover:bg-sand-100 dark:text-ink-500 dark:hover:text-ink-100 dark:hover:bg-ink-800",
              )}
            >
              {s}x
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onSleepTimer}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            "motion-safe:transition-all motion-safe:duration-150 active:scale-90 motion-reduce:active:scale-100",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
            sleepTimerRemaining !== null
              ? "text-clay-500 bg-clay-500/10 dark:text-clay-400"
              : "text-sand-300 hover:text-forest-700 hover:bg-forest-50 dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-100",
          )}
          aria-label={
            sleepTimerRemaining !== null
              ? `Sleep timer: ${formatDuration(sleepTimerRemaining)}`
              : "Set sleep timer"
          }
        >
          <Clock className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
