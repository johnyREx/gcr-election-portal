import Image from "next/image";
import Link from "next/link";

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

export default function CandidatePreview() {
  return (
    <Section>
      <Container>
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              Election Candidates
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Meet the Candidates
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Learn about the people contesting in the GCR General Elections.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/candidates">View All Candidates</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-slate-100">
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

              <CardContent>
                <p className="text-sm text-slate-600">
                  {candidate.location}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}