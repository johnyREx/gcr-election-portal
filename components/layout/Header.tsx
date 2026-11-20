"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Container from "./Container";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Election", href: "/elections" },
  { label: "Candidates", href: "/candidates" },
  { label: "Results", href: "/results" },
  { label: "Constitution", href: "/constitution" },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-200 bg-white shadow-sm">
      {/* Ghana national colours */}
      <div aria-hidden="true" className="flex h-1">
        <div className="flex-1 bg-red-700" />
        <div className="flex-1 bg-yellow-500" />
        <div className="flex-1 bg-green-700" />
      </div>

      <div className="relative z-[101] bg-white/95 backdrop-blur-md">
        <Container>
          <div className="flex min-h-[76px] items-center justify-between gap-4">
            {/* Official ACGC branding */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="group flex min-w-0 items-center gap-3"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 group-hover:border-green-300 group-hover:shadow-md sm:h-14 sm:w-14">
                <Image
                  src="/images/acgc-logo.png"
                  alt="ACGC official logo"
                  fill
                  priority
                  sizes="(min-width: 640px) 56px, 48px"
                  className="object-contain p-1"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-extrabold leading-tight tracking-tight text-slate-950 sm:text-lg">
                    ACGC Election Portal
                  </p>

                  <span className="hidden rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 sm:inline-flex">
                    2026
                  </span>
                </div>

                <p className="mt-1 hidden truncate text-xs text-slate-500 sm:block">
                  Electoral Commission · Ghanaian Community in Russia
                </p>
              </div>
            </Link>

            {/* Desktop navigation */}
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
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-green-50 text-green-800"
                        : "text-slate-600 hover:bg-slate-50 hover:text-green-800"
                    }`}
                  >
                    {item.label}

                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-[19px] h-0.5 rounded-full bg-green-700"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/announcements"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
              >
                Official Notices
              </Link>

              <Link
                href="/candidates"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-green-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
              >
                View Candidates
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="acgc-mobile-navigation"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              className="relative z-[110] flex h-12 w-12 shrink-0 touch-manipulation cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm active:scale-95 active:bg-green-50 lg:hidden"
            >
              {mobileMenuOpen ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="pointer-events-none h-6 w-6"
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
                  className="pointer-events-none h-6 w-6"
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
        </Container>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div
          id="acgc-mobile-navigation"
          className="absolute left-0 top-full z-[105] w-full border-t border-slate-200 bg-white shadow-xl lg:hidden"
        >
          <Container>
            <div className="max-h-[calc(100dvh-80px)] overflow-y-auto py-5">
              {/* Election information */}
              <div className="mb-5 flex items-center justify-between rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                    Election Information
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    ACGC General Elections 2026
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="flex h-3 w-3 rounded-full bg-green-600"
                />
              </div>

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
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-green-50 text-green-800"
                          : "text-slate-700 active:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile actions */}
              <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
                <Link
                  href="/announcements"
                  onClick={closeMobileMenu}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900"
                >
                  Official Notices
                </Link>

                <Link
                  href="/candidates"
                  onClick={closeMobileMenu}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-green-700 px-5 text-sm font-semibold text-white"
                >
                  View Candidates
                </Link>
              </div>

              {/* Mobile association branding */}
              <div className="mt-6 flex items-center gap-3 border-t border-slate-200 px-2 pt-5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image
                    src="/images/acgc-logo.png"
                    alt=""
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Association of Compatriots
                  <br />
                  Ghanaian Community in Russia
                </p>
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}