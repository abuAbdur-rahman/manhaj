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
        "fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-sand-200 bg-sand-100",
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
              "flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-h-11 min-w-11 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
              isActive
                ? "text-forest-600"
                : "text-sand-300 hover:text-forest-700",
            )}
          >
            <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
            <span className="text-[13px] font-medium leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
