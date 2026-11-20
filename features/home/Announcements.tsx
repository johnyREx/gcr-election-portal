import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  Users,
} from "lucide-react";

import Container from "@/components/layout/Container";
import { announcements } from "@/constants/announcements";

/* =========================================================
   OFFICIAL RESOURCES
========================================================= */

const resources = [
  {
    title: "Candidate Register",
    description: "Approved candidates and profiles",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Election Timetable",
    description: "Official dates and election stages",
    href: "/elections",
    icon: CalendarDays,
  },
  {
    title: "Constitution",
    description: "Community governing framework",
    href: "/constitution",
    icon: BookOpen,
  },
  {
    title: "Official Notices",
    description: "All Electoral Commission updates",
    href: "/announcements",
    icon: FileText,
  },
];

/* =========================================================
   ANNOUNCEMENTS COMPONENT
========================================================= */

export default function Announcements() {
  const latestAnnouncements = announcements.slice(0, 3);

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white py-12 sm:py-16">

      {/* Subtle decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-green-50/60 blur-3xl"
      />

      <Container>
        <div className="relative z-10">

          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-green-700" />

                <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-700">
                  Electoral Commission
                </p>
              </div>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Updates &amp; resources
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Latest official election notices and
                essential resources in one place.
              </p>
            </div>

            <Link
              href="/announcements"
              className="inline-flex h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
            >
              All Notices
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

          {/* =================================================
              MAIN CONTENT GRID
          ================================================= */}

          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 md:grid-cols-2">

            {/* ===============================================
                LEFT COLUMN — ANNOUNCEMENTS
            =============================================== */}

            <div className="min-w-0 p-5 sm:p-6 lg:p-7">

              {/* Column heading */}
              <div className="mb-5 flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                    Latest Notices
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold text-slate-950">
                    Election announcements
                  </h3>
                </div>

                <span
                  aria-hidden="true"
                  className="relative flex h-3 w-3 shrink-0"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-40" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-600" />
                </span>

              </div>

              {/* Announcement list */}
              <div className="space-y-3">

                {latestAnnouncements.map(
                  (announcement, index) => (
                    <article
                      key={announcement.id}
                      className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition duration-300 hover:border-green-200 hover:bg-green-50/40"
                    >
                      <div className="flex items-start gap-3">

                        {/* Announcement number */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-green-700 shadow-sm">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        {/* Announcement content */}
                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-1 xl:flex-row xl:items-start xl:justify-between xl:gap-3">

                            <h4 className="text-sm font-bold leading-5 text-slate-950 sm:text-base">
                              {announcement.title}
                            </h4>

                            <span className="shrink-0 text-xs font-semibold text-slate-400">
                              {announcement.date}
                            </span>

                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {announcement.description}
                          </p>

                          {index === 0 && (
                            <span className="mt-3 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-800">
                              Latest Update
                            </span>
                          )}

                        </div>
                      </div>
                    </article>
                  )
                )}

                {latestAnnouncements.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-500">
                      No official announcements available yet.
                    </p>
                  </div>
                )}

              </div>

              {/* View all announcements */}
              <Link
                href="/announcements"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-green-700 transition hover:gap-3 hover:text-green-900"
              >
                View all official announcements
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

            {/* ===============================================
                RIGHT COLUMN — RESOURCES
            =============================================== */}

            <div className="min-w-0 border-t border-slate-200 bg-slate-50/80 p-5 sm:p-6 md:border-t-0 lg:p-7">

              {/* Column heading */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                  Official Resources
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-slate-950">
                  Quick access
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Access the principal documents and
                  information for the 2026 election.
                </p>
              </div>

              {/* Resource links */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">

                {resources.map((resource) => {
                  const Icon = resource.icon;

                  return (
                    <Link
                      key={resource.title}
                      href={resource.href}
                      className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
                    >

                      {/* Resource icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700 transition group-hover:bg-green-700 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Resource information */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold leading-5 text-slate-900">
                          {resource.title}
                        </h4>

                        <p className="mt-1 text-xs leading-4 text-slate-500">
                          {resource.description}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-700" />

                    </Link>
                  );
                })}

              </div>

              {/* Official information notice */}
              <div className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3">

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-800">
                  Official Information
                </p>

                <p className="mt-1 text-xs leading-5 text-green-950">
                  Election status, voting access and
                  results availability are controlled
                  by the Electoral Commission.
                </p>

              </div>

            </div>

          </div>

        </div>
      </Container>
    </section>
  );
}