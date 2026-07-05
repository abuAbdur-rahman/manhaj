import { cn } from "@/components/ui/cn";

interface WaveformSealProps {
  className?: string;
  variant?: "inline" | "watermark" | "skeleton" | "muted";
  barCount?: number;
}

const barHeights = [
  [4, 10, 3, 8, 5, 9, 4],
  [6, 12, 5, 10, 7, 11, 6],
  [3, 8, 4, 7, 3, 9, 5],
];

export function WaveformSeal({
  className,
  variant = "inline",
  barCount = 7,
}: WaveformSealProps) {
  const heights = barHeights[0].slice(0, barCount);

  const baseClasses = "flex items-end gap-0.5";

  const variantClasses = {
    inline: "text-forest-500",
    watermark: "opacity-[0.06] text-forest-50",
    skeleton: "text-forest-500/30 motion-safe:animate-pulse",
    muted: "text-sand-300",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-hidden="true"
    >
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-current"
          style={{ height: `${h * 2}px` }}
        />
      ))}
    </div>
  );
}
