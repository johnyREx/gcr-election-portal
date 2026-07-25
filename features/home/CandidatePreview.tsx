import Image from "next/image";
import Link from "next/link";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { candidates } from "@/constants/candidates";

export default function CandidatePreview() {
  const featuredCandidates = candidates.slice(0, 3);

  return (
    <Section className="bg-white">
      <Container>
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              Election Candidates
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Meet the people seeking to serve
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Review the candidates, the positions
              they are contesting and the visions they
              have for the Ghanaian Community in
              Russia.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-fit"
          >
            <Link href="/candidates">
              View All Candidates
            </Link>
          </Button>
        </div>

        {featuredCandidates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {featuredCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href="/candidates"
                className="group block"
              >
                <Card className="h-full overflow-hidden border-slate-200 transition duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <Image
                      src={candidate.image}
                      alt={candidate.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-5 pb-5 pt-16">
                      <p className="text-sm font-semibold text-green-300">
                        {candidate.position}
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-white">
                        {candidate.name}
                      </h3>
                    </div>
                  </div>

                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {candidate.location ||
                          "Russia"}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-green-700 transition group-hover:translate-x-1">
                      View profile →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-slate-50 px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              Candidate list coming soon
            </h3>

            <p className="mt-2 text-slate-600">
              Approved candidates will appear here
              after the vetting process.
            </p>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-green-100 bg-green-50 p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-slate-900">
              Make an informed decision
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Read candidate profiles and compare
              their plans before casting your ballot.
            </p>
          </div>

          <Button
            asChild
            className="mt-5 bg-green-700 hover:bg-green-800 sm:mt-0"
          >
            <Link href="/candidates">
              Explore Candidate Profiles
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}