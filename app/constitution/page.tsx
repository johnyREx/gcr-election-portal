import Link from "next/link";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Scale,
  ShieldCheck,
  Vote,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const chapters = [
  {
    number: 1,
    title: "The Community and the Constitution",
  },
  {
    number: 2,
    title: "Membership",
  },
  {
    number: 3,
    title: "Finances",
  },
  {
    number: 4,
    title: "The Structure of the Community",
  },
  {
    number: 5,
    title: "The Executive Council",
  },
  {
    number: 6,
    title: "The Legislative Council",
  },
  {
    number: 7,
    title: "Judicial Council",
  },
  {
    number: 8,
    title: "Standing and Ad Hoc Committees",
  },
  {
    number: 9,
    title: "Council of Elders",
  },
  {
    number: 10,
    title: "Elections",
  },
  {
    number: 11,
    title: "The General Assembly",
  },
  {
    number: 12,
    title: "Resignation and Removal",
  },
  {
    number: 13,
    title: "Branch Communities",
  },
  {
    number: 14,
    title: "Amendment and Revision",
  },
];

const electionArticles = [
  {
    article: "Article 27",
    title: "Right to Vote",
    description:
      "Every eligible member has one vote. Voting eligibility is also linked to fulfilment of dues-payment responsibilities at the time the voters register is compiled.",
    icon: Vote,
  },
  {
    article: "Article 28",
    title: "Candidate Qualifications",
    description:
      "Sets membership, residency, disciplinary, nomination and vetting requirements for members seeking elected office.",
    icon: ShieldCheck,
  },
  {
    article: "Article 29",
    title: "Conduct of General Elections",
    description:
      "Provides for secret ballots, electronic voting, winning requirements, run-offs, vacancies, election dates and provisional results.",
    icon: Scale,
  },
  {
    article: "Article 30",
    title: "Vetting",
    description:
      "Establishes the vetting panel, publication of criteria, candidate scoring, recommendations and the process for challenging vetting decisions.",
    icon: FileText,
  },
  {
    article: "Articles 31–33",
    title: "Results and Electoral Commission",
    description:
      "Covers election petitions, the independence of the Electoral Commission and its responsibility for voter registration, elections and voter education.",
    icon: BookOpen,
  },
];

export default function ConstitutionPage() {
  return (
    <>
      <Section className="border-b bg-slate-50">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <BookOpen className="h-8 w-8" />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              Governing Document
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              2024 Constitution
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              The constitutional framework governing the community,
              its institutions, membership and electoral process.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-green-700 hover:bg-green-800"
              >
                <a
                  href="/documents/2024-gcr-constitution.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Constitution
                </a>
              </Button>

              <Button asChild size="lg" variant="outline">
                <a
                  href="/documents/2024-gcr-constitution.pdf"
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="font-bold text-amber-950">
                Organizational name notice
              </h2>

              <p className="mt-3 leading-7 text-amber-900">
                This Constitution was adopted in 2024 under the name
                Ghanaian Community in Russia, abbreviated as GCR.
                The organization subsequently adopted the registered name
                Association of Compatriots “Ghanaian Community”, abbreviated
                as ACGC. References to GCR in the original document are
                therefore preserved as part of the constitutional record.
              </p>
            </div>

            <div className="mt-12">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
                  Document Structure
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Constitution chapters
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  The Constitution contains fourteen chapters covering
                  membership, governance, finances, elections and
                  constitutional amendments.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {chapters.map((chapter) => (
                  <Card
                    key={chapter.number}
                    className={
                      chapter.number === 10
                        ? "border-green-300 bg-green-50"
                        : "border-slate-200"
                    }
                  >
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-green-700">
                        Chapter {chapter.number}
                      </p>

                      <h3 className="mt-2 font-bold text-slate-900">
                        {chapter.title}
                      </h3>

                      {chapter.number === 10 ? (
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-green-800">
                          Election provisions
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-slate-50">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
                Chapter 10
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Key election provisions
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                These articles form the constitutional foundation of the
                ACGC election process.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {electionArticles.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.article}
                    className="border-slate-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="mt-5 text-sm font-semibold text-green-700">
                        {item.article}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-3 leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl bg-slate-900 p-7 text-white sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  Read the complete official document
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  The summaries on this page are provided for convenience.
                  The uploaded PDF remains the complete constitutional text.
                </p>
              </div>

              <Button
                asChild
                className="mt-5 bg-green-600 hover:bg-green-700 sm:mt-0"
              >
                <a
                  href="/documents/2024-gcr-constitution.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Full Constitution
                </a>
              </Button>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/elections"
                className="text-sm font-semibold text-green-700 hover:underline"
              >
                View election information →
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}