"use client";

import { LogOut, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useState } from "react";
import { AdminIdentityProvider } from "@/components/layout/admin-identity";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import type { AdminRole } from "@/types";

interface AdminDashboardShellProps {
  children: ReactNode;
  role: AdminRole;
  admin: {
    name: string;
    email: string;
  };
}

export function AdminDashboardShell({
  children,
  role,
  admin,
}: AdminDashboardShellProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }, [router, supabase]);

  const handleMenuClick = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  return (
    <AdminIdentityProvider value={admin}>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <div className="flex min-h-screen">
          <AdminSidebar
            role={role}
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((prev) => !prev)}
            onSignOut={handleSignOut}
            className="hidden lg:flex"
          />
          <main className="flex-1">{children}</main>
          <AdminMobileNav
            role={role}
            onMenuClick={handleMenuClick}
            className="lg:hidden"
          />
        </div>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav
            className="flex flex-col gap-1 px-4 pb-6"
            aria-label="Admin menu"
          >
            {role === "super_admin" && (
              <>
                <Link
                  href="/admin/scholars"
                  onClick={() => setIsSheetOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forest-700 transition-colors hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800"
                >
                  <Users className="h-4 w-4" />
                  Scholars
                </Link>
                <Link
                  href="/admin/admins"
                  onClick={() => setIsSheetOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forest-700 transition-colors hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800"
                >
                  <Shield className="h-4 w-4" />
                  Admins
                </Link>
              </>
            )}
            <Link
              href="/admin/settings"
              onClick={() => setIsSheetOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forest-700 transition-colors hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsSheetOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forest-700 transition-colors hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </AdminIdentityProvider>
  );
}
