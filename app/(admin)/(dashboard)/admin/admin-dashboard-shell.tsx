"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { createClient } from "@/lib/supabase/client";
import type { AdminRole } from "@/types";

interface AdminDashboardShellProps {
  children: ReactNode;
  role: AdminRole;
}

export function AdminDashboardShell({
  children,
  role,
}: AdminDashboardShellProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }, [router, supabase]);

  const handleMenuClick = useCallback(() => {
    // TODO: open menu sheet for mobile
  }, []);

  return (
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
  );
}
