import Link from "next/link";

import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t bg-slate-950 text-slate-300">
      <Container>
        <div className="flex flex-col items-center gap-5 py-10 text-center">
          <div>
            <h3 className="text-lg font-bold text-white">
              ACGC Election Portal
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Official Election Platform of the Association of
              Compatriots "Ghanaian Community" in Russia
            </p>

            <p className="mt-3 text-sm italic text-green-400">
              One Community. One Vote. One Future.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm">
            <Link href="/" className="hover:text-white">
              Home
            </Link>

            <Link href="/candidates" className="hover:text-white">
              Candidates
            </Link>

            <Link href="/vote" className="hover:text-white">
              Vote
            </Link>

            <Link href="/results" className="hover:text-white">
              Results
            </Link>
          </nav>

          <div className="border-t border-slate-800 pt-5 text-sm text-slate-500">
            <p>
              © {new Date().getFullYear()} Association of Compatriots
              "Ghanaian Community" in Russia.
            </p>

            <p className="mt-2">
              Designed & Developed by{" "}
              <a
                href="https://github.com/johnyREx"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-400 hover:underline"
              >
                John Kwofie
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}