"use client";

import { type MouseEvent, type TouchEvent, useCallback, useRef } from "react";
import { cn } from "@/components/ui/cn";

interface ScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

export function Scrubber({
  currentTime,
  duration,
  onSeek,
  className,
}: ScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const calculateTime = useCallback(
    (clientX: number) => {
      if (!trackRef.current || duration <= 0) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      return ratio * duration;
    },
    [duration],
  );

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const time = calculateTime(e.clientX);
    onSeek(time);

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const t = calculateTime(e.clientX);
      onSeek(t);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    const time = calculateTime(touch.clientX);
    onSeek(time);

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      const t = calculateTime(e.touches[0].clientX);
      onSeek(t);
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-2 w-full cursor-pointer rounded-full bg-sand-200",
        className,
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      tabIndex={0}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-forest-500 transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-forest-500 shadow-sm"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}
