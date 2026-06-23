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
        "flex flex-col items-center justify-center px-4 py-12 text-center",
        className,
      )}
    >
      {icon ?? <WaveformSeal variant="skeleton" className="mb-4 scale-150" />}
      <h3 className="mt-4 text-sm font-semibold text-forest-900">{title}</h3>
      <p className="mt-1 max-w-[280px] text-sm text-forest-700 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
