import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { candidates } from "@/constants/candidates";

interface CandidatePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CandidatePage({
  params,
}: CandidatePageProps) {
  const { slug } = await params;

  const candidate = candidates.find(
    (candidate) => candidate.slug === slug
  );

  if (!candidate) {
    notFound();
  }

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-6xl">
          {/* Page heading */}
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              ACGC General Elections 2026
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              {candidate.jointTicket
                ? "Presidential Ticket"
                : "Candidate Profile"}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Official candidate information following the
              completion of the Electoral Commission&apos;s
              vetting process.
            </p>
          </div>

          {/* Main candidate information */}
          <div className="grid gap-10 lg:grid-cols-[460px_1fr]">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-white">
                <Image
                  src={candidate.image}
                  alt={candidate.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Card>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge>
                  {candidate.position}
                </Badge>

                <Badge
                  variant="secondary"
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approved
                </Badge>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  {candidate.position}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                  {candidate.name}
                </h2>
              </div>

              {/* Joint ticket */}
              {candidate.jointTicket &&
                candidate.runningMate && (
                  <>
                    <div className="my-7 border-t" />

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                        {candidate.runningMatePosition}
                      </p>

                      <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {candidate.runningMate}
                      </h2>
                    </div>
                  </>
                )}

              <p className="mt-8 text-lg leading-8 text-slate-600">
                {candidate.bio}
              </p>

              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Vetted and approved by the Electoral Commission
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <Card>
              <CardContent className="p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Vision
                </p>

                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  Vision for the Community
                </h2>

                <p className="mt-5 leading-7 text-slate-600">
                  {candidate.vision}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Priorities
                </p>

                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  Key Priorities
                </h2>

                <ul className="mt-5 space-y-4">
                  {candidate.priorities.map(
                    (priority) => (
                      <li
                        key={priority}
                        className="flex items-start gap-3 text-slate-600"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

                        <span>{priority}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Candidate information notice */}
          <Card className="mt-12 border-green-200 bg-green-50/50">
            <CardContent className="p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                Electoral Commission
              </p>

              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Approved Candidate
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                This candidate successfully completed the
                Electoral Commission&apos;s vetting process and
                has been approved to contest in the ACGC General
                Elections 2026.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}