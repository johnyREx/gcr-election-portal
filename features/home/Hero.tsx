import Link from "next/link";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-green-700">
            Official Election Platform
          </p>

          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl">
            Ghanaian Community
            <br />
            in Russia
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600">
            Conducting transparent, fair and accessible elections through a
            secure digital platform built for the Ghanaian Community in Russia.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/vote">Vote Now</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/elections">
                Current Election
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}