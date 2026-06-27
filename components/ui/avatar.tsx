import Image from "next/image";
import { cn } from "@/components/ui/cn";

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-xl",
};

const sizePx = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
};

export function Avatar({
  className,
  size = "md",
  fallback,
  alt = "",
  src,
}: AvatarProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-forest-100 font-medium text-forest-700",
          sizeClasses[size],
          className,
        )}
        role="img"
        aria-label={alt || fallback || "Avatar"}
      >
        {getInitials(fallback) ?? "?"}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(
        "shrink-0 rounded-full object-cover",
        sizeClasses[size],
        className,
      )}
      unoptimized={
        !src.includes("r2.dev") && !src.includes("cloudflarestorage.com")
      }
    />
  );
}
