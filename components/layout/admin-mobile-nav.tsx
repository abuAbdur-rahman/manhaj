"use client";

import { Headphones, LayoutDashboard, Library, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import type { AdminRole } from "@/types";

interface AdminMobileNavProps {
  role: AdminRole;
  onMenuClick: () => void;
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: AdminRole[];
}

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "scholar_admin"],
  },
  {
    href: "/admin/episodes",
    label: "Episodes",
    icon: Headphones,
    roles: ["super_admin", "scholar_admin"],
  },
  {
    href: "/admin/series",
    label: "Series",
    icon: Library,
    roles: ["super_admin", "scholar_admin"],
  },
];

export function AdminMobileNav({
  role,
  onMenuClick,
  className,
}: AdminMobileNavProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-sand-200 bg-sand-100 h-[calc(3.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] dark:border-ink-700 dark:bg-ink-900",
        className,
      )}
      aria-label="Admin navigation"
    >
      {visibleItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-h-11 min-w-11 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
              isActive
                ? "text-forest-600 dark:text-ink-100"
                : "text-sand-300 hover:text-forest-700 dark:text-ink-500 dark:hover:text-ink-100",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
            <span className="text-[13px] font-medium leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onMenuClick}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-h-11 min-w-11 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 text-sand-300 hover:text-forest-700 dark:text-ink-500 dark:hover:text-ink-100",
        )}
        aria-label="More menu"
      >
        <Menu className="h-[22px] w-[22px]" aria-hidden="true" />
        <span className="text-[13px] font-medium leading-none">Menu</span>
      </button>
    </nav>
  );
}
