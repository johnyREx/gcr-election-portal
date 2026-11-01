import Link from "next/link";

import Container from "@/components/layout/Container";
import { electionTimeline } from "@/constants/electionTimeline";

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Completed";

    case "current":
      return "Current";

    default:
      return "Upcoming";
  }
}

function getCircleClasses(status: string) {
  switch (status) {
    case "completed":
      return "border-green-700 bg-green-700 text-white";

    case "current":
      return "border-amber-500 bg-amber-50 text-amber-700 ring-4 ring-amber-100";

    default:
      return "border-slate-300 bg-white text-slate-400";
  }
}

function getLineClasses(status: string) {
  return status === "completed"
    ? "bg-green-700"
    : "bg-slate-200";
}

export default function ElectionTimeline() {
  const currentStage =
    electionTimeline.find(
      (item) => item.status === "current"
    ) || electionTimeline[0];

  const currentIndex =
    electionTimeline.findIndex(
      (item) => item.status === "current"
    );

  const nextStage =
    currentIndex >= 0 &&
    currentIndex < electionTimeline.length - 1
      ? electionTimeline[currentIndex + 1]
      : null;

  return (
    <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-14">
      <Container>
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-green-700" />

              <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-700">
                Official Timetable
              </p>
            </div>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Election journey
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Follow the official stages of the ACGC
              General Elections 2026 from nominations
              through the final declaration.
            </p>
          </div>

          <Link
            href="/elections"
            className="inline-flex h-10 w-fit shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
          >
            Full Election Timetable →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[850px] px-7 py-8">
              <div className="flex">
                {electionTimeline.map(
                  (item, index) => {
                    const isLast =
                      index ===
                      electionTimeline.length - 1;

                    return (
                      <div
                        key={item.id}
                        className="relative flex flex-1 flex-col items-center text-center"
                      >
                        {!isLast && (
                          <div
                            className={`absolute left-1/2 top-5 h-1 w-full ${getLineClasses(
                              item.status
                            )}`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-extrabold transition ${getCircleClasses(
                            item.status
                          )}`}
                        >
                          {item.status ===
                          "completed"
                            ? "✓"
                            : index + 1}
                        </div>

                        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                          Stage {index + 1}
                        </p>

                        <p className="mt-1 max-w-[120px] text-xs font-bold leading-5 text-slate-800">
                          {item.title}
                        </p>

                        <span
                          className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                            item.status ===
                            "completed"
                              ? "text-green-700"
                              : item.status ===
                                  "current"
                                ? "text-amber-700"
                                : "text-slate-400"
                          }`}
                        >
                          {getStatusLabel(
                            item.status
                          )}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <div className="grid border-t border-slate-200 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="relative mt-1 flex h-3 w-3 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
                </span>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                    Current Stage
                  </p>

                  <h3 className="mt-1 text-lg font-extrabold text-slate-950">
                    {currentStage.title}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-green-700">
                    {currentStage.date}
                  </p>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {currentStage.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-950 p-5 text-white sm:p-6 lg:border-l lg:border-t-0">
              {nextStage ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-400">
                    Up Next
                  </p>

                  <h3 className="mt-2 font-bold">
                    {nextStage.title}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {nextStage.date}
                  </p>

                  <Link
                    href="/elections"
                    className="mt-4 inline-flex text-sm font-bold text-green-400 transition hover:text-green-300"
                  >
                    View timetable →
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-400">
                    Final Stage
                  </p>

                  <h3 className="mt-2 font-bold">
                    Election process concluding
                  </h3>

                  <Link
                    href="/results"
                    className="mt-4 inline-flex text-sm font-bold text-green-400 transition hover:text-green-300"
                  >
                    Election results →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Timetable changes will be communicated
          through official Electoral Commission
          notices.
        </p>
      </Container>
    </section>
  );
}