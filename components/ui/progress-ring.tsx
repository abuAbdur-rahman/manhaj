import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

interface ProgressRingProps {
  /** 0..100. Ignored when `indeterminate`. */
  value: number;
  size?: number;
  strokeWidth?: number;
  indeterminate?: boolean;
  className?: string;
  /** Tailwind color class for the filled arc (uses `currentColor`). */
  arcClassName?: string;
  children?: ReactNode;
}

/**
 * Circular progress indicator. Determinate shows `value`%; indeterminate
 * shows a pulsing partial arc (no spinner-style rotation, to respect the
 * "no cycling icon" requirement). Reduced-motion users get a static arc.
 */
export function ProgressRing({
  value,
  size = 36,
  strokeWidth = 3,
  indeterminate = false,
  className,
  arcClassName,
  children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-sand-200 dark:text-ink-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.72 : offset}
          className={cn(
            "motion-safe:transition-[stroke-dashoffset] motion-safe:duration-300 ease-out",
            "text-forest-500 dark:text-forest-500",
            indeterminate && "motion-safe:animate-pulse",
            arcClassName,
          )}
        />
      </svg>
      {children && (
        <span className="relative z-10 flex items-center justify-center">
          {children}
        </span>
      )}
    </span>
  );
}
