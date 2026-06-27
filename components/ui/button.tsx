import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 disabled:pointer-events-none disabled:opacity-50 min-h-11 min-w-11",
  {
    variants: {
      variant: {
        primary:
          "bg-forest-500 text-white hover:bg-forest-600 active:bg-forest-700",
        secondary:
          "bg-sand-100 text-forest-900 hover:bg-sand-200 active:bg-sand-300",
        ghost: "text-forest-700 hover:bg-sand-100 active:bg-sand-200",
        clay: "bg-clay-500 text-white hover:bg-clay-600 active:bg-clay-500",
        outline:
          "border border-sand-200 text-forest-700 hover:bg-sand-100 active:bg-sand-200",
        destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
      },
      size: {
        sm: "h-9 px-3 text-sm",
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
