import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  Trophy,
  Users,
  Vote,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const icons = {
  Constitution: BookOpen,
  Candidates: Users,
  Vote: Vote,
  Results: Trophy,
  Timeline: CalendarDays,
  Announcements: FileText,
};

export default function QuickLinks() {
  const links = [
    {
      title: "Constitution",
      href: "/constitution",
      description:
        "Read the governing constitution of ACGC.",
    },
    {
      title: "Candidates",
      href: "/candidates",
      description:
        "Meet all approved election candidates.",
    },
    {
      title: "Vote",
      href: "/vote",
      description:
        "Access the secure electronic voting portal.",
    },
    {
      title: "Results",
      href: "/results",
      description:
        "View official election results.",
    },
    {
      title: "Timeline",
      href: "/elections",
      description:
        "Important election dates and milestones.",
    },
    {
      title: "Announcements",
      href: "/announcements",
      description:
        "Official notices from the Election Committee.",
    },
  ];

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Explore
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Quick Access
          </h2>

          <p className="mt-4 text-slate-600">
            Everything you need to participate in the
            2026 ACGC General Elections.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => {
            const Icon =
              icons[
                link.title as keyof typeof icons
              ];

            return (
              <Link
                key={link.title}
                href={link.href}
                className="group"
              >
                <Card className="h-full border-slate-200 transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-green-700">
                      {link.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {link.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-green-700">
                      Open

                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}