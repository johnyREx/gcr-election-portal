"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  verifyAdminSession,
} from "@/services/electionService";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const token = window.sessionStorage.getItem(
        "gcr-admin-token"
      );

      if (!token) {
        router.replace(
          `/admin/login?next=${encodeURIComponent(pathname)}`
        );
        return;
      }

      try {
        const response =
          await verifyAdminSession(token);

        if (!response.admin) {
          throw new Error(
            "Administrator session is invalid."
          );
        }

        if (isMounted) {
          setIsChecking(false);
        }
      } catch {
        window.sessionStorage.removeItem(
          "gcr-admin-token"
        );

        window.sessionStorage.removeItem(
          "gcr-admin-user"
        );

        router.replace(
          `/admin/login?next=${encodeURIComponent(pathname)}`
        );
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-600">
          Verifying administrator session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}