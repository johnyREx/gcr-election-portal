import Image from "next/image";
import Link from "next/link";

import Container from "./Container";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Election", href: "/elections" },
  { label: "Candidates", href: "/candidates" },
  { label: "Vote", href: "/vote" },
  { label: "Results", href: "/results" },
];

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-slate-950 text-slate-300">

      {/* Ghanaian national colours */}
      <div
        aria-hidden="true"
        className="flex h-1.5 w-full"
      >
        <div className="w-1/3 bg-red-600" />
        <div className="w-1/3 bg-yellow-400" />
        <div className="w-1/3 bg-green-600" />
      </div>

      {/* Decorative background watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/2 -z-10 h-80 w-80 -translate-y-1/2 opacity-[0.07] md:h-[450px] md:w-[450px]"
      >
        <Image
          src="/images/acgc-watermark.png"
          alt=""
          fill
          sizes="(min-width: 768px) 450px, 320px"
          className="object-contain"
        />
      </div>

      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-2 md:gap-16">

          {/* Organization branding */}
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">

            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white p-2 shadow-xl">
              <Image
                src="/images/acgc-logo.png"
                alt="ACGC official logo"
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            </div>

            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                ACGC Election Portal
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                Association of Compatriots
                <br />
                Ghanaian Community in Russia
              </p>

              <p className="mt-3 text-xs font-medium uppercase tracking-wider text-yellow-400">
                Electoral Commission
              </p>

              <p className="mt-3 text-sm italic text-green-400">
                One Community. One Vote. One Future.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center md:items-end">

            <h4 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">
              Quick Links
            </h4>

            <nav
              aria-label="Footer navigation"
              className="flex max-w-md flex-wrap justify-center gap-x-6 gap-y-4 text-sm font-medium md:justify-end"
            >
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors duration-200 hover:text-yellow-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-medium text-green-400">
              ACGC General Elections 2026
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">

          <p>
            © {new Date().getFullYear()} ACGC.
            All rights reserved.
          </p>

          <p>
            Designed &amp; Developed by{" "}
            <a
              href="https://github.com/johnyREx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-400 transition hover:text-green-300 hover:underline"
            >
              John Kwofie
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}