"use client";

import { Download, Home, Search, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/scholars",
    label: "Scholars",
    icon: Users,
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
  },
  {
    href: "/downloads",
    label: "Downloads",
    icon: Download,
  },
];

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around",
        "border-t border-sand-200/80 bg-sand-50/90 backdrop-blur-lg backdrop-saturate-150",
        "h-[calc(3.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)]",
        "dark:border-ink-700/60 dark:bg-ink-900/90",
        className,
      )}
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 min-h-11 min-w-11 rounded-xl touch-bounce",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
              isActive
                ? "text-forest-600 dark:text-ink-100"
                : "text-sand-300 hover:text-forest-700 dark:text-ink-500 dark:hover:text-ink-100",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-forest-500 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 dark:bg-ink-100"
                aria-hidden="true"
              />
            )}
            <Icon
              className={cn(
                "h-[22px] w-[22px] motion-safe:transition-transform motion-safe:duration-150",
                isActive && "motion-safe:scale-110",
              )}
              aria-hidden="true"
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={cn(
                "text-[11px] leading-none motion-safe:transition-all motion-safe:duration-150",
                isActive ? "font-semibold" : "font-medium",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
