"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Container from "./Container";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Election",
    href: "/elections",
  },
  {
    label: "Candidates",
    href: "/candidates",
  },
  {
    label: "Results",
    href: "/results",
  },
  {
    label: "Constitution",
    href: "/constitution",
  },
];

function isActiveRoute(
  pathname: string,
  href: string
) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div
        aria-hidden="true"
        className="grid h-1 grid-cols-3"
      >
        <div className="bg-red-700" />
        <div className="bg-yellow-500" />
        <div className="bg-green-700" />
      </div>

      <Container>
        <div className="flex min-h-20 items-center justify-between gap-6">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-700 text-sm font-extrabold text-white shadow-sm transition group-hover:bg-green-800">
              ACGC
            </div>

            <div className="min-w-0">
              <p className="text-base font-bold leading-tight text-slate-950 sm:text-lg">
                ACGC Election Portal
              </p>

              <p className="mt-1 hidden max-w-xs truncate text-xs text-slate-500 sm:block">
                One Community. One Vote. One Future.
              </p>
            </div>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            {navigation.map((item) => {
              const active = isActiveRoute(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-green-50 text-green-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="outline"
              className="border-slate-300"
            >
              <Link href="/announcements">
                Official Notices
              </Link>
            </Button>

            <Button
              asChild
              className="bg-green-700 px-6 hover:bg-green-800"
            >
              <Link href="/vote">
                Cast Your Ballot
              </Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            onClick={() =>
              setMobileMenuOpen((current) => !current)
            }
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          >
            <span className="sr-only">
              Toggle navigation
            </span>

            {mobileMenuOpen ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 py-5 lg:hidden">
            <nav
              aria-label="Mobile navigation"
              className="space-y-1"
            >
              {navigation.map((item) => {
                const active = isActiveRoute(
                  pathname,
                  item.href
                );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-green-50 text-green-800"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link
                  href="/announcements"
                  onClick={closeMobileMenu}
                >
                  Official Notices
                </Link>
              </Button>

              <Button
                asChild
                className="w-full bg-green-700 hover:bg-green-800"
              >
                <Link
                  href="/vote"
                  onClick={closeMobileMenu}
                >
                  Cast Your Ballot
                </Link>
              </Button>
            </div>

            <p className="mt-5 px-4 text-xs leading-5 text-slate-500">
              Association of Compatriots
              &ldquo;Ghanaian Community&rdquo; in
              Russia
            </p>
          </div>
        )}
      </Container>
    </header>
  );
}