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
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <Container>
        <div className="flex flex-col gap-6 py-7 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h3 className="text-base font-bold text-white">
              ACGC Election Portal
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Electoral Commission · Ghanaian Community in Russia
            </p>

            <p className="mt-2 text-xs italic text-green-400">
              One Community. One Vote. One Future.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium md:justify-end"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-green-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 py-4 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} ACGC. All rights reserved.
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