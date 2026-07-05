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
    <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 text-forest-700 text-sm font-medium transition-colors">
      <button
        type="button"
        className={cn(
          "rounded-full px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
          selected ? "bg-forest-100 text-forest-700" : "hover:bg-sand-200",
          onRemove ? "pr-1" : "pr-3",
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
          className="rounded-full p-0.5 mr-1 hover:bg-forest-500/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
