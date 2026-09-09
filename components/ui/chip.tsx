"use client";

import { X } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
}

export function Chip({
  className,
  children,
  selected = false,
  onRemove,
  ...props
}: ChipProps) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-sand-100 text-forest-700 text-sm font-medium shadow-sm motion-safe:transition-all motion-safe:duration-150 dark:bg-ink-800 dark:text-ink-100">
      <button
        type="button"
        className={cn(
          "rounded-full px-3.5 py-2 motion-safe:transition-all motion-safe:duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
          "active:scale-[0.97] motion-reduce:active:scale-100",
          selected
            ? "bg-forest-100 text-forest-700 shadow-sm dark:bg-ink-700 dark:text-ink-100"
            : "hover:bg-sand-200 dark:hover:bg-ink-700",
          onRemove ? "pr-1" : "pr-3.5",
          className,
        )}
        {...props}
      >
        {children}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-full p-1 mr-1.5 hover:bg-forest-500/10 motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:hover:bg-ink-700"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
