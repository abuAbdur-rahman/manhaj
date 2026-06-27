"use client";

import { Clock, SkipBack, SkipForward } from "lucide-react";
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
  onSpeedChange,
  onSleepTimer,
  className,
}: PlayerControlsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Scrubber currentTime={currentTime} duration={duration} onSeek={onSeek} />

      <div className="flex items-center justify-between px-4">
        <span className="font-mono text-xs text-sand-300 w-12 text-right">
          {formatDuration(currentTime)}
        </span>
        <span className="font-mono text-xs text-sand-300 w-12">
          {formatDuration(duration)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={onSkipBack}
          className="flex h-11 w-11 items-center justify-center rounded-full text-forest-700 hover:bg-forest-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
          aria-label="Skip back 10 seconds"
        >
          <SkipBack className="h-5 w-5" />
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
          className="flex h-11 w-11 items-center justify-center rounded-full text-forest-700 hover:bg-forest-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={cn(
                "flex h-8 w-10 items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
                s === speed
                  ? "bg-forest-100 text-forest-700"
                  : "text-sand-300 hover:text-forest-700",
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
            "flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
            sleepTimerRemaining !== null
              ? "text-clay-500 bg-clay-500/10"
              : "text-sand-300 hover:text-forest-700 hover:bg-forest-50",
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
