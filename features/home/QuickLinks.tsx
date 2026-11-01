import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  Lock,
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

const links = [
  {
    title: "Candidates",
    href: "/candidates",
    description:
      "Review all approved candidates and their submitted credentials.",
    icon: Users,
    featured: true,
  },
  {
    title: "Election Timeline",
    href: "/elections",
    description:
      "Follow the official election timetable and important milestones.",
    icon: CalendarDays,
    featured: true,
  },
  {
    title: "Constitution",
    href: "/constitution",
    description:
      "Read the governing constitution of the Ghanaian community.",
    icon: BookOpen,
  },
  {
    title: "Announcements",
    href: "/announcements",
    description:
      "Read official election notices and important updates.",
    icon: FileText,
  },
];

export default function QuickLinks() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Election Resources
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Quick Access
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Access candidate information, election
            dates, official notices and other resources
            for the ACGC General Elections 2026.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.title}
                href={link.href}
                className="group"
              >
                <Card
                  className={`h-full transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    link.featured
                      ? "border-green-200 bg-green-50/40 hover:border-green-400"
                      : "border-slate-200 bg-white hover:border-green-200"
                  }`}
                >
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                        <Icon className="h-6 w-6" />
                      </div>

                      {link.featured && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          Recommended
                        </span>
                      )}
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-slate-900 transition group-hover:text-green-700">
                      {link.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {link.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-green-700">
                      Open

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Vote className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">
                    Voting Portal
                  </h3>

                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Opens on Election Day
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              The secure voting portal will become
              available when polls are officially
              opened by the Electoral Commission.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Trophy className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">
                    Election Results
                  </h3>

                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Not Yet Published
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Official results will become available
              only after publication has been
              authorized by the Electoral Commission.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}