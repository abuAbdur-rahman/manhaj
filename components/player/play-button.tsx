import { Loader2, Pause, Play } from "lucide-react";
import { cn } from "@/components/ui/cn";

interface PlayButtonProps {
  isPlaying: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  onClick: () => void;
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function PlayButton({
  isPlaying,
  isLoading = false,
  size = "md",
  onClick,
  className,
}: PlayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-forest-500 text-white transition-all hover:bg-forest-600 active:scale-95 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
        sizeClasses[size],
        className,
      )}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", iconSizes[size])} />
      ) : isPlaying ? (
        <Pause className={iconSizes[size]} />
      ) : (
        <Play className={iconSizes[size]} />
      )}
    </button>
  );
}
