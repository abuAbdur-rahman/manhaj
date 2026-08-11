"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium motion-safe:transition-all motion-safe:duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 disabled:pointer-events-none disabled:opacity-50 min-h-11 min-w-11 active:scale-[0.97] motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        primary:
          "bg-forest-500 text-white shadow-sm hover:bg-forest-600 active:bg-forest-700 hover:shadow-md",
        secondary:
          "bg-sand-100 text-forest-900 hover:bg-sand-200 active:bg-sand-300 shadow-sm dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700 dark:active:bg-ink-700",
        ghost:
          "text-forest-700 hover:bg-sand-100 active:bg-sand-200 dark:text-ink-100 dark:hover:bg-ink-800 dark:active:bg-ink-700",
        clay: "bg-clay-500 text-white shadow-sm hover:bg-clay-600 active:bg-clay-500 hover:shadow-md",
        outline:
          "border border-sand-200 text-forest-700 hover:bg-sand-100 active:bg-sand-200 dark:border-ink-700 dark:text-ink-100 dark:hover:bg-ink-800 dark:active:bg-ink-700",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 hover:shadow-md",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-lg",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
