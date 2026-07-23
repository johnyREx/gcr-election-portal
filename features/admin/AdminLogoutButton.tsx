"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logoutAdmin } from "@/services/electionService";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  async function handleLogout() {
    const token = window.sessionStorage.getItem(
      "gcr-admin-token"
    );

    try {
      setIsLoggingOut(true);

      if (token) {
        await logoutAdmin(token);
      }
    } catch {
      // Clear the local session even if the server request fails.
    } finally {
      window.sessionStorage.removeItem(
        "gcr-admin-token"
      );

      window.sessionStorage.removeItem(
        "gcr-admin-user"
      );

      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoggingOut
        ? "Signing out..."
        : "Sign Out"}
    </button>
  );
}