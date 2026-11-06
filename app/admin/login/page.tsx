import { Suspense } from "react";

import AdminLogin from "@/features/admin/AdminLogin";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-600">
            Loading admin login...
          </p>
        </div>
      }
    >
      <AdminLogin />
    </Suspense>
  );
}