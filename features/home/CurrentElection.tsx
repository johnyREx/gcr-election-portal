"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  type Election,
  getElection,
} from "@/services/electionService";

function getStatusClasses(status?: string) {
  switch (status) {
    case "Open":
      return "border-green-200 bg-green-100 text-green-800";

    case "Closed":
      return "border-red-200 bg-red-100 text-red-800";

    case "Results Published":
      return "border-blue-200 bg-blue-100 text-blue-800";

    case "Draft":
      return "border-slate-200 bg-slate-100 text-slate-700";

    default:
      return "border-amber-200 bg-amber-100 text-amber-800";
  }
}

function getStatusMessage(status?: string) {
  switch (status) {
    case "Open":
      return "Voting is currently open. Eligible voters may proceed to cast their ballots.";

    case "Closed":
      return "Voting has closed. Please wait for the official publication of results.";

    case "Results Published":
      return "Voting has concluded and the official election results are now available.";

    case "Draft":
      return "Election preparations are currently underway.";

    default:
      return "Election information is being updated.";
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

  const isOpen = election?.status === "Open";
  const resultsPublished =
    Boolean(election?.resultsVisible);

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Election Update
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Current Election
          </h2>

          <p className="mt-4 text-slate-600">
            Follow the status of the GCR General
            Elections and access the official voting
            portal.
          </p>
        </div>

        <Card className="mx-auto max-w-5xl overflow-hidden border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-[1.4fr_0.6fr]">
              <div className="p-7 sm:p-9">
                {isLoading ? (
                  <p className="text-slate-600">
                    Loading election information...
                  </p>
                ) : error ? (
                  <div>
                    <p className="font-semibold text-red-700">
                      Election information unavailable
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {error}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Official Election
                        </p>

                        <h3 className="mt-1 text-2xl font-bold text-slate-900">
                          {election?.title ||
                            "GCR General Elections 2026"}
                        </h3>
                      </div>

                      <Badge
                        variant="outline"
                        className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${getStatusClasses(
                          election?.status
                        )}`}
                      >
                        {election?.status ||
                          "Status unavailable"}
                      </Badge>
                    </div>

                    <p className="mt-6 max-w-2xl leading-7 text-slate-600">
                      {getStatusMessage(
                        election?.status
                      )}
                    </p>

                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">
                          Voting period
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          21–22 November 2026
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">
                          Winning requirement
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          50% + 1 of valid votes
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col justify-center border-t bg-slate-900 p-7 text-white sm:p-9 lg:border-l lg:border-t-0">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-300">
                  Election Access
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                  Make your voice count.
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Verify your voter information,
                  complete your ballot and submit it
                  securely.
                </p>

                <div className="mt-7 space-y-3">
                  {isOpen ? (
                    <Button
                      asChild
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Link href="/vote">
                        Vote Now
                      </Link>
                    </Button>
                  ) : resultsPublished ? (
                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Link href="/results">
                        View Official Results
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full"
                    >
                      Voting Not Open
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white"
                  >
                    <Link href="/elections">
                      Election Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}