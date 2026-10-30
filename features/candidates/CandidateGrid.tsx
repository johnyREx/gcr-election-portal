import Image from "next/image";
import Link from "next/link";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { candidates } from "@/constants/candidates";

export default function CandidateGrid() {
  return (
    <Section>
      <Container>
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Election 2026
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Meet the Candidates
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Meet the candidates approved by the Electoral Commission
            for the ACGC General Elections 2026.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <Card
              key={candidate.id}
              className="overflow-hidden"
            >
              <div className="relative aspect-square bg-white">
                <Image
                  src={candidate.image}
                  alt={candidate.name}
                  fill
                  className="object-contain"
                />
              </div>

              <CardHeader>
                <p className="text-sm font-semibold text-green-700">
                  {candidate.position}
                </p>

                <CardTitle>
                  {candidate.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  {candidate.bio}
                </p>

                <p className="text-sm font-medium text-green-700">
                  ✓ Approved by the Electoral Commission
                </p>

                <Link
                  href={`/candidates/${candidate.slug}`}
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  View Candidate
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}