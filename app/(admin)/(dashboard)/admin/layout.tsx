import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminDashboardShell } from "./admin-dashboard-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <AdminDashboardShell role={admin.role}>{children}</AdminDashboardShell>
  );
}
