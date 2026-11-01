"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Container from "@/components/layout/Container";
import {
  type Election,
  getElection,
} from "@/services/electionService";

function getElectionState(
  status?: string,
  resultsVisible?: boolean
) {
  if (
    status === "Results Published" ||
    resultsVisible
  ) {
    return {
      banner: "Official Results Published",
      stage: "Results",
      stageDetail: "Published",
      progress: 7,
      message:
        "The election has concluded and the official results are now available.",
      messageClasses:
        "border-blue-200 bg-blue-50 text-blue-950",
      labelClasses:
        "text-blue-800",
      dot: "bg-blue-400",
      actionLabel: "View Official Results",
      actionHref: "/results",
      actionClasses:
        "bg-blue-700 hover:bg-blue-800",
    };
  }

  switch (status) {
    case "Open":
      return {
        banner: "Polls Are Officially Open",
        stage: "Voting",
        stageDetail: "Polls open",
        progress: 6,
        message:
          "Voting is now open. Eligible voters may proceed to the secure voting portal and cast their ballots.",
        messageClasses:
          "border-green-200 bg-green-50 text-green-950",
        labelClasses:
          "text-green-800",
        dot: "bg-green-400",
        actionLabel: "Cast Your Ballot",
        actionHref: "/vote",
        actionClasses:
          "bg-green-700 hover:bg-green-800",
      };

    case "Closed":
      return {
        banner: "Voting Has Closed",
        stage: "Voting Closed",
        stageDetail: "Awaiting next update",
        progress: 6,
        message:
          "Voting has officially closed. Please await further communication from the Electoral Commission.",
        messageClasses:
          "border-red-200 bg-red-50 text-red-950",
        labelClasses:
          "text-red-800",
        dot: "bg-red-400",
        actionLabel: "Election Information",
        actionHref: "/elections",
        actionClasses:
          "bg-slate-900 hover:bg-slate-800",
      };

    case "Draft":
      return {
        banner: "Election Preparations Underway",
        stage: "Preparation",
        stageDetail: "In progress",
        progress: 1,
        message:
          "Election preparations are currently underway. Official information will be published as it becomes available.",
        messageClasses:
          "border-slate-200 bg-slate-50 text-slate-800",
        labelClasses:
          "text-slate-600",
        dot: "bg-slate-400",
        actionLabel: "Election Information",
        actionHref: "/elections",
        actionClasses:
          "bg-slate-900 hover:bg-slate-800",
      };

    default:
      return {
        banner: "Official Election Information",
        stage: "Election Process",
        stageDetail: "In progress",
        progress: 5,
        message:
          "Follow official election information and updates from the Electoral Commission.",
        messageClasses:
          "border-amber-200 bg-amber-50 text-amber-950",
        labelClasses:
          "text-amber-800",
        dot: "bg-amber-400",
        actionLabel: "Meet the Candidates",
        actionHref: "/candidates",
        actionClasses:
          "bg-green-700 hover:bg-green-800",
      };
  }
}

export default function Hero() {
  const [election, setElection] =
    useState<Election | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const loadElection = useCallback(async () => {
    try {
      const response = await getElection();

      setElection(response.election || null);
    } catch {
      setElection(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadElection();
  }, [loadElection]);

  const state = getElectionState(
    election?.status,
    Boolean(election?.resultsVisible)
  );

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#fbfcfa]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:52px_52px]" />

        <div className="absolute -left-40 top-10 h-[420px] w-[420px] animate-pulse rounded-full bg-green-100/60 blur-[100px]" />

        <div className="absolute -right-32 bottom-0 h-[360px] w-[360px] rounded-full bg-yellow-100/60 blur-[100px]" />

        <div className="absolute left-1/2 top-1/3 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-red-50/70 blur-[100px]" />
      </div>

      <div className="border-b border-green-900/10 bg-green-950 text-white">
        <Container>
          <div className="flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-center sm:flex-row sm:gap-4 sm:py-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${state.dot}`}
                />

                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${state.dot}`}
                />
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-green-100">
                {isLoading
                  ? "Loading Election Status"
                  : state.banner}
              </span>
            </div>

            <span className="hidden h-4 w-px bg-white/20 sm:block" />

            <span className="text-xs font-medium text-slate-300">
              Admin Controlled Election Status
            </span>

            <span className="hidden h-4 w-px bg-white/20 md:block" />

            <span className="hidden text-xs font-semibold text-white md:inline">
              Election Day · 22 November 2026
            </span>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid min-h-[620px] items-center gap-10 py-14 lg:min-h-[640px] lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-10 bg-green-700" />

              <p className="text-xs font-bold uppercase tracking-[0.28em] text-green-700 sm:text-sm">
                ACGC General Elections 2026
              </p>
            </div>

            <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Your voice.
              <span className="mt-2 block text-green-700">
                Your community.
              </span>
              <span className="mt-2 block">
                Your future.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              The official digital election platform
              for the Ghanaian Community in Russia.
              Review approved candidates, follow the
              election process and participate when
              authorized by the Electoral Commission.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={state.actionHref}
                className={`inline-flex h-12 items-center justify-center rounded-lg px-7 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${state.actionClasses}`}
              >
                {state.actionLabel}
              </Link>

              {state.actionHref !==
                "/candidates" && (
                <Link
                  href="/candidates"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white/80 px-7 text-sm font-bold text-slate-900 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50"
                >
                  Meet the Candidates
                </Link>
              )}

              {state.actionHref ===
                "/candidates" && (
                <Link
                  href="/elections"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white/80 px-7 text-sm font-bold text-slate-900 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50"
                >
                  Election Information
                </Link>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-600" />

                <span className="font-semibold text-slate-700">
                  7 approved candidates
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />

                <span className="font-semibold text-slate-700">
                  6 electoral contests
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${state.dot}`}
                />

                <span className="font-semibold text-slate-700">
                  {isLoading
                    ? "Checking election status..."
                    : state.banner}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-green-100/80 via-white to-yellow-100/60 blur-xl"
            />

            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                    Election Brief
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Live official election information
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-green-200 bg-green-50">
                  <span className="text-sm font-extrabold text-green-800">
                    EC
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-200">
                <div className="border-r border-slate-200 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Election Day
                  </p>

                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">
                    22
                  </p>

                  <p className="mt-1 font-bold text-green-700">
                    November 2026
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Current Status
                  </p>

                  <p className="mt-3 text-xl font-extrabold text-slate-950">
                    {isLoading
                      ? "Checking..."
                      : state.stage}
                  </p>

                  <p
                    className={`mt-2 text-sm font-semibold ${state.labelClasses}`}
                  >
                    {isLoading
                      ? "Loading"
                      : state.stageDetail}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Election Progress
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      Stage {state.progress} of 7
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${state.messageClasses}`}
                  >
                    {state.stage}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  {Array.from({
                    length: 7,
                  }).map((_, index) => {
                    const completed =
                      index < state.progress;

                    return (
                      <div
                        key={index}
                        className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                          completed
                            ? "bg-green-700"
                            : "bg-slate-200"
                        }`}
                      />
                    );
                  })}
                </div>

                <div
                  className={`mt-6 rounded-xl border px-4 py-3 ${state.messageClasses}`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.14em] ${state.labelClasses}`}
                  >
                    Election Status
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-6">
                    {isLoading
                      ? "Checking the latest election status..."
                      : state.message}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 border-t border-slate-200 bg-slate-50">
                <div className="p-4 text-center">
                  <p className="text-xl font-extrabold text-slate-950">
                    7
                  </p>

                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Candidates
                  </p>
                </div>

                <div className="border-x border-slate-200 p-4 text-center">
                  <p className="text-xl font-extrabold text-slate-950">
                    6
                  </p>

                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Contests
                  </p>
                </div>

                <div className="p-4 text-center">
                  <p className="text-xl font-extrabold text-green-700">
                    50%+1
                  </p>

                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Threshold
                  </p>
                </div>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 -z-10 h-28 w-28 rounded-full border-[18px] border-yellow-300/20"
            />

            <div
              aria-hidden="true"
              className="absolute -left-6 -top-6 -z-10 h-20 w-20 rounded-full border-[14px] border-green-600/10"
            />
          </div>
        </div>
      </Container>

      <div className="border-t border-slate-200 bg-white/80">
        <Container>
          <div className="grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center justify-center gap-3 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                ✓
              </span>

              <span className="text-sm font-semibold text-slate-700">
                Candidates vetted
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                ✓
              </span>

              <span className="text-sm font-semibold text-slate-700">
                Secure digital voting
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                ✓
              </span>

              <span className="text-sm font-semibold text-slate-700">
                Official results publication
              </span>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}