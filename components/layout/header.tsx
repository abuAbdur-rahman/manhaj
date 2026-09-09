"use client";

import { ArrowLeft, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { useAdminIdentity } from "./admin-identity";

const PUBLIC_ROOT_PATHS = new Set(["/", "/scholars", "/search", "/downloads"]);
const ADMIN_ROOT_PATHS = new Set([
  "/admin",
  "/admin/episodes",
  "/admin/series",
  "/admin/scholars",
  "/admin/admins",
]);

interface HeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  adminActions?: ReactNode;
  home?: boolean;
  className?: string;
}

function isRootPath(pathname: string) {
  return PUBLIC_ROOT_PATHS.has(pathname) || ADMIN_ROOT_PATHS.has(pathname);
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return <div className="h-11 w-11" />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        "text-forest-700 hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
      )}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

function AdminIdentityAction() {
  const admin = useAdminIdentity();
  if (!admin) return null;

  return (
    <div className="hidden min-w-0 items-center gap-2 rounded-full border border-sand-200 bg-sand-100 px-2 py-1 sm:flex dark:border-ink-700 dark:bg-ink-800">
      <Avatar size="sm" fallback={admin.name} alt={admin.name} />
      <span className="max-w-28 truncate text-xs font-medium text-forest-700 dark:text-ink-100">
        {admin.name}
      </span>
    </div>
  );
}

export function Header({
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
  adminActions,
  home = false,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = !home && !isRootPath(pathname);
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
        "h-[calc(3.5rem+env(safe-area-inset-top))] border-b border-sand-200 bg-sand-50/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur",
        "dark:border-ink-700 dark:bg-ink-900/95",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {home ? (
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
            <div className="relative h-7 w-7 shrink-0">
              <Image
                src="/logo.png"
                alt="Manhaj"
                fill
                className="object-contain"
                loading="eager"
              />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-lg font-semibold text-forest-700 dark:text-ink-100">
                Manhaj
              </span>
              {title && (
                <span className="block truncate text-xs font-medium text-forest-500 dark:text-ink-500">
                  {title}
                </span>
              )}
            </div>
          </Link>
        ) : (
          <>
            {showBack && (
              <button
                type="button"
                onClick={() =>
                  backHref ? router.push(backHref) : router.back()
                }
                aria-label={`Back${backLabel ? ` to ${backLabel}` : ""}`}
                className={cn(
                  "-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
                  "text-forest-700 hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
                )}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0">
              {title && (
                <span className="block truncate text-sm font-semibold text-forest-900 dark:text-ink-100">
                  {title}
                </span>
              )}
              {subtitle && (
                <span className="block truncate text-xs font-medium text-forest-500 dark:text-ink-500">
                  {subtitle}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-end gap-1">
        {actions}
        {adminActions}
        {isAdmin && <AdminIdentityAction />}
        <ThemeToggle />
      </div>
    </header>
  );
}
