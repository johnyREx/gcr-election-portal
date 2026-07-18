import Link from "next/link";
import Container from "./Container";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-green-700"
          >
            GCR Election Portal
          </Link>

          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/">Home</Link>
            <Link href="/candidates">Candidates</Link>
            <Link href="/vote">Vote</Link>
            <Link href="/results">Results</Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}