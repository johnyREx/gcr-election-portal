import Image from "next/image";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { candidates } from "@/constants/candidates";
import Link from "next/link";

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
            Learn more about the candidates contesting in the upcoming
            Ghanaian Community in Russia elections.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={candidate.image}
                  alt={candidate.name}
                  fill
                  className="object-cover"
                />
              </div>

              <CardHeader>
                <p className="text-sm font-semibold text-green-700">
                  {candidate.position}
                </p>

                <CardTitle>{candidate.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-slate-900">
                    {candidate.location}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {candidate.bio}
                  </p>
                </div>

                <Button asChild className="w-full">
                    <Link href={`/candidates/${candidate.slug}`}>
                    View Candidate
                    </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}