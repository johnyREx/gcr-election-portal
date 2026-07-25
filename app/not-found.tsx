import Link from "next/link";
import {
  ArrowLeft,
  Home,
  SearchX,
  Vote,
} from "lucide-react";

import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-slate-50 py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-700">
            <SearchX className="h-10 w-10" />
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
            Error 404
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            This page could not be found
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
            The page may have been moved, removed or the address may be
            incorrect. Return to the ACGC Election Portal or continue to the
            voting page.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-green-700 px-7 hover:bg-green-800"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/vote">
                <Vote className="mr-2 h-4 w-4" />
                Cast Your Ballot
              </Link>
            </Button>
          </div>

          <div className="mt-8">
            <Button asChild variant="ghost">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to the Election Portal
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}