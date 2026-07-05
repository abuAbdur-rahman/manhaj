"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-forest-900 placeholder:text-sand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
