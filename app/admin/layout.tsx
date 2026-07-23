"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import AdminGuard from "@/features/admin/AdminGuard";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}