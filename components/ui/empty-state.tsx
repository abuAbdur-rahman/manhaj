import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { WaveformSeal } from "@/components/ui/waveform-seal";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center page-enter",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-50/80 dark:bg-ink-800/80">
        {icon ?? <WaveformSeal variant="skeleton" className="scale-125" />}
      </div>
      <h3 className="mt-5 text-base font-semibold text-forest-900 dark:text-ink-100">
        {title}
      </h3>
      <p className="mt-2 max-w-[280px] text-sm text-sand-300 leading-relaxed dark:text-ink-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
