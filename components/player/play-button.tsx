"use client";

import { Loader2, Pause, Play } from "lucide-react";
import { cn } from "@/components/ui/cn";

type PlayButtonSize = "sm" | "md" | "lg" | "xl";

interface PlayButtonProps {
  isPlaying?: boolean;
  isLoading?: boolean;
  size?: PlayButtonSize;
  onClick?: () => void;
  className?: string;
}

const sizeConfig: Record<PlayButtonSize, { button: string; icon: number }> = {
  sm: { button: "w-10 h-10", icon: 16 },
  md: { button: "w-12 h-12", icon: 20 },
  lg: { button: "w-16 h-16", icon: 28 },
  xl: { button: "w-24 h-24", icon: 48 },
};

export function PlayButton({
  isPlaying = false,
  isLoading = false,
  size = "md",
  onClick,
  className,
}: PlayButtonProps) {
  const config = sizeConfig[size];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-150",
        "bg-forest-600 text-white hover:bg-forest-700 active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        "shadow-lg hover:shadow-xl",
        config.button,
        className,
      )}
      aria-label={isPlaying ? "Pause" : "Play"}
      title={isPlaying ? "Pause" : "Play"}
    >
      {isLoading ? (
        <Loader2 size={config.icon} className="animate-spin" />
      ) : isPlaying ? (
        <Pause size={config.icon} fill="currentColor" />
      ) : (
        <Play size={config.icon} fill="currentColor" />
      )}
    </button>
  );
}
