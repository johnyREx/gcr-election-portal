import Image from "next/image";
import { notFound } from "next/navigation";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
        <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
          <Card className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={candidate.image}
                alt={candidate.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Card>

          <div>
            <Badge variant="secondary">
              {candidate.position}
            </Badge>

            <h1 className="mt-4 text-4xl font-bold text-slate-900">
              {candidate.name}
            </h1>

            <p className="mt-2 text-slate-600">
              {candidate.location}
            </p>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              {candidate.bio}
            </p>

            <Card className="mt-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Vision
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  {candidate.vision}
                </p>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Priorities
              </h2>

              <ul className="mt-4 space-y-3">
                {candidate.priorities.map((priority) => (
                  <li
                    key={priority}
                    className="rounded-xl border bg-white px-4 py-3 text-slate-700"
                  >
                    {priority}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}