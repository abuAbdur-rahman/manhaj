"use client";

import { createContext, type ReactNode, useContext } from "react";

interface AdminIdentity {
  name: string;
  email: string;
}

const AdminIdentityContext = createContext<AdminIdentity | null>(null);

export function AdminIdentityProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AdminIdentity;
}) {
  return (
    <AdminIdentityContext.Provider value={value}>
      {children}
    </AdminIdentityContext.Provider>
  );
}

export function useAdminIdentity() {
  return useContext(AdminIdentityContext);
}
