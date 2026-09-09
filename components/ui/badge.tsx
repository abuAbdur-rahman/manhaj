import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-forest-100 text-forest-700 dark:bg-ink-800 dark:text-ink-100",
        secondary:
          "bg-sand-100 text-forest-700 dark:bg-ink-800 dark:text-ink-100",
        outline:
          "border border-sand-200 text-sand-300 dark:border-ink-700 dark:text-ink-500",
        clay: "bg-clay-500/10 text-clay-500 dark:text-clay-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
