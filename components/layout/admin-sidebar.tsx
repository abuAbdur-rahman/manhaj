"use client";

import {
  ChevronLeft,
  Headphones,
  LayoutDashboard,
  Library,
  LogOut,
  Shield,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import type { AdminRole } from "@/types";

interface AdminSidebarProps {
  role: AdminRole;
  isCollapsed: boolean;
  onToggle: () => void;
  onSignOut: () => void;
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
    href: "/admin/scholars",
    label: "Scholars",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    href: "/admin/admins",
    label: "Admins",
    icon: Shield,
    roles: ["super_admin"],
  },
  {
    href: "/admin/series",
    label: "Series",
    icon: Library,
    roles: ["super_admin", "scholar_admin"],
  },
  {
    href: "/admin/episodes",
    label: "Episodes",
    icon: Headphones,
    roles: ["super_admin", "scholar_admin"],
  },
];

export function AdminSidebar({
  role,
  isCollapsed,
  onToggle,
  onSignOut,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sand-200 bg-sand-100 transition-all duration-200 dark:border-ink-700 dark:bg-ink-900",
        isCollapsed ? "w-16" : "w-60",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-sand-200 px-3 dark:border-ink-700">
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <div className="relative h-6 w-6 shrink-0">
              <Image
                src="/logo.png"
                alt="Manhaj"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-sm font-semibold text-forest-700 dark:text-ink-100">
              Admin
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2" aria-label="Admin navigation">
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
                isActive
                  ? "bg-forest-50 text-forest-700 dark:bg-ink-800 dark:text-ink-100"
                  : "text-forest-700 hover:bg-sand-50 dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-100",
                isCollapsed && "justify-center px-2",
              )}
              aria-current={isActive ? "page" : undefined}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sand-200 p-2 dark:border-ink-700">
        <button
          type="button"
          onClick={onSignOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forest-700 transition-colors hover:bg-sand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-100",
            isCollapsed && "justify-center px-2",
          )}
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
