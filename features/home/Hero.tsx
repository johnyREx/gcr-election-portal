import Link from "next/link";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <Section className="relative overflow-hidden border-b bg-white py-20 sm:py-28 lg:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-green-100/70 blur-3xl" />

        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-yellow-100/60 blur-3xl" />

        <div className="absolute -right-32 top-24 h-72 w-72 rounded-full bg-red-100/50 blur-3xl" />
      </div>

      <Container>
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            Official AC-GC Election Platform
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Your voice shapes
            <span className="block text-green-700">
              our community.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
            A transparent, fair and accessible digital
            election platform created for the Ghanaian
            Community in Russia.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-w-44 bg-green-700 px-8 hover:bg-green-800"
            >
              <Link href="/vote">
                Cast Your Vote
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-44 px-8"
            >
              <Link href="/candidates">
                Meet the Candidates
              </Link>
            </Button>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            <div className="rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-green-700">
                Verified
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                Eligible voters only
              </p>
            </div>

            <div className="rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-green-700">
                Secure
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                One voter, one ballot
              </p>
            </div>

            <div className="rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-green-700">
                Transparent
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                Officially published results
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}