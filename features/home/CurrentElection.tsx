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

function getStatusConfig(status?: string) {
  switch (status) {
    case "Open":
      return {
        label: "Polls Open",
        message:
          "Voting is currently open. Eligible voters may proceed to the secure voting portal and cast their ballots.",
        dot: "bg-green-500",
        badge:
          "border-green-200 bg-green-50 text-green-800",
      };

    case "Closed":
      return {
        label: "Voting Closed",
        message:
          "Voting has officially closed. Please await further communication from the Electoral Commission.",
        dot: "bg-red-500",
        badge:
          "border-red-200 bg-red-50 text-red-800",
      };

    case "Results Published":
      return {
        label: "Results Published",
        message:
          "The election has concluded and the official results are now available.",
        dot: "bg-blue-500",
        badge:
          "border-blue-200 bg-blue-50 text-blue-800",
      };

    case "Draft":
      return {
        label: "Election Preparation",
        message:
          "Election preparations are currently underway. Official updates will be published as they become available.",
        dot: "bg-slate-400",
        badge:
          "border-slate-200 bg-slate-50 text-slate-700",
      };

    default:
      return {
        label: "Election Update",
        message:
          "Official election information is currently being updated.",
        dot: "bg-amber-500",
        badge:
          "border-amber-200 bg-amber-50 text-amber-800",
      };
  }
}

export default function CurrentElection() {
  const [election, setElection] =
    useState<Election | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const loadElection = useCallback(async () => {
    try {
      setError("");

      const response = await getElection();

      setElection(response.election || null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load election information."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadElection();
  }, [loadElection]);

  const status = getStatusConfig(
    election?.status
  );

  const isOpen = election?.status === "Open";

  const resultsPublished =
    election?.status === "Results Published" ||
    Boolean(election?.resultsVisible);

  return (
    <section className="border-b border-slate-200 bg-slate-50 py-10 sm:py-12">
      <Container>
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-green-600" />

                <p className="font-semibold text-slate-600">
                  Loading official election status...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white px-6 py-7 shadow-sm">
              <p className="font-bold text-red-700">
                Election information unavailable
              </p>

              <p className="mt-2 text-sm text-slate-600">
                {error}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid lg:grid-cols-[1fr_auto]">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                          {isOpen && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                          )}

                          <span
                            className={`relative inline-flex h-3 w-3 rounded-full ${status.dot}`}
                          />
                        </span>

                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                          Live Election Status
                        </p>
                      </div>

                      <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                        {election?.title ||
                          "GCR General Elections 2026"}
                      </h2>

                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                        {status.message}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Election Day
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        22 November 2026
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Current Status
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {election?.status ||
                          "Unavailable"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Winning Requirement
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        50% + 1
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[260px] flex-col justify-center border-t border-slate-200 bg-slate-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
                    Election Access
                  </p>

                  {isOpen ? (
                    <>
                      <h3 className="mt-3 text-xl font-bold">
                        Voting is open
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Verify your details and proceed
                        to your ballot.
                      </p>

                      <Link
                        href="/vote"
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-green-600 px-5 text-sm font-bold text-white transition hover:bg-green-500"
                      >
                        Vote Now
                      </Link>
                    </>
                  ) : resultsPublished ? (
                    <>
                      <h3 className="mt-3 text-xl font-bold">
                        Results available
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        View the officially published
                        election results.
                      </p>

                      <Link
                        href="/results"
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-500"
                      >
                        View Results
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-3 text-xl font-bold">
                        Follow the election
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Review official election
                        information and important
                        updates.
                      </p>

                      <Link
                        href="/elections"
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                      >
                        Election Details
                      </Link>
                    </>
                  )}

                  {isOpen && (
                    <Link
                      href="/elections"
                      className="mt-3 text-center text-xs font-semibold text-slate-400 transition hover:text-white"
                    >
                      View election details →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}