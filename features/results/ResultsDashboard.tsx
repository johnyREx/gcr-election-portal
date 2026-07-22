"use client";

import { useEffect, useState } from "react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getElection,
  getResults,
  type PositionResult,
  type ResultsSummary,
} from "@/services/electionService";

interface ResultsDashboardProps {
  mode?: "public" | "admin";
}

function getDecisionStyles(status: PositionResult["status"]) {
  switch (status) {
    case "WINNER_DECLARED":
      return "border-green-200 bg-green-50 text-green-800";

    case "RUNOFF_REQUIRED":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "TIE":
      return "border-orange-200 bg-orange-50 text-orange-800";

    case "NO_VOTES":
    case "NO_CANDIDATES":
      return "border-slate-200 bg-slate-50 text-slate-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getDecisionTitle(status: PositionResult["status"]) {
  switch (status) {
    case "WINNER_DECLARED":
      return "Winner Declared";

    case "RUNOFF_REQUIRED":
      return "Runoff Required";

    case "TIE":
      return "Tie";

    case "NO_VOTES":
      return "No Votes Cast";

    case "NO_CANDIDATES":
      return "No Candidates";

    default:
      return "Result";
  }
}

export default function ResultsDashboard({
  mode = "public",
}: ResultsDashboardProps) {
  const [summary, setSummary] =
    useState<ResultsSummary | null>(null);

  const [results, setResults] =
    useState<PositionResult[]>([]);

  const [resultsVisible, setResultsVisible] =
    useState(false);

  const [electionStatus, setElectionStatus] =
    useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      try {
        setError("");

        const electionResponse =
          await getElection();

        if (!isMounted) {
          return;
        }

        const election =
          electionResponse.election;

        const canViewResults =
          mode === "admin" ||
          Boolean(election?.resultsVisible);

        setResultsVisible(canViewResults);
        setElectionStatus(
          election?.status || ""
        );

        if (!canViewResults) {
          return;
        }

        const resultsResponse =
          await getResults();

        if (!isMounted) {
          return;
        }

        setSummary(resultsResponse.summary);
        setResults(
          resultsResponse.results || []
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load election results."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      isMounted = false;
    };
  }, [mode]);

  if (isLoading) {
    return (
      <Section>
        <Container>
          <p className="text-center text-slate-600">
            Loading election results...
          </p>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="bg-slate-50">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-red-800">
              Unable to Load Results
            </h1>

            <p className="mt-3 text-red-700">
              {error}
            </p>
          </div>
        </Container>
      </Section>
    );
  }

  if (!resultsVisible) {
    return (
      <Section className="bg-slate-50">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardContent className="py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                  🔒
                </div>

                <h1 className="mt-6 text-3xl font-bold text-slate-900">
                  Results Not Yet Published
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-slate-600">
                  Candidate results will become
                  available after the Election
                  Committee officially publishes
                  them.
                </p>

                {electionStatus && (
                  <p className="mt-5 text-sm text-slate-500">
                    Election status:{" "}
                    <span className="font-semibold text-slate-700">
                      {electionStatus}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            GCR General Elections 2026
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            Election Results
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Official results calculated using the
            constitutional requirement of 50% plus
            one of valid votes cast.
          </p>

          {mode === "admin" && (
            <p className="mt-3 text-sm font-semibold text-amber-700">
              Administrative preview
            </p>
          )}
        </div>

        {summary && (
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-slate-600">
                  Registered Voters
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-bold text-slate-900">
                  {summary.registeredVoters}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-slate-600">
                  Ballots Cast
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-bold text-slate-900">
                  {summary.votesCast}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-slate-600">
                  Turnout
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-bold text-green-700">
                  {summary.turnoutPercentage}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-slate-600">
                  Vote Records
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-bold text-slate-900">
                  {summary.totalVoteRecords}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600">
              No election results are currently
              available.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {results.map((result) => (
              <Card key={result.position}>
                <CardHeader>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        {result.position}
                      </CardTitle>

                      <p className="mt-2 text-sm text-slate-500">
                        {result.totalValidVotes} valid{" "}
                        {result.totalValidVotes === 1
                          ? "vote"
                          : "votes"}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-white px-4 py-3 text-left sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Winning threshold
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {result.winningThreshold}
                      </p>

                      <p className="text-xs text-slate-500">
                        {result.majorityRule}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-5 rounded-lg border px-4 py-4 ${getDecisionStyles(
                      result.status
                    )}`}
                  >
                    <p className="font-bold">
                      {getDecisionTitle(
                        result.status
                      )}
                    </p>

                    <p className="mt-1 text-sm">
                      {result.message}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {result.candidates.length === 0 ? (
                    <p className="rounded-md bg-slate-50 px-4 py-6 text-center text-slate-600">
                      No candidates are registered
                      for this position.
                    </p>
                  ) : (
                    result.candidates.map(
                      (candidate) => {
                        const isWinner =
                          result.status ===
                            "WINNER_DECLARED" &&
                          result.winner &&
                          String(
                            result.winner.id
                          ) ===
                            String(candidate.id);

                        const isRunoffCandidate =
                          result.runoffCandidates.some(
                            (runoffCandidate) =>
                              String(
                                runoffCandidate.id
                              ) ===
                              String(candidate.id)
                          );

                        return (
                          <div
                            key={String(
                              candidate.id
                            )}
                            className={`rounded-xl border p-4 ${
                              isWinner
                                ? "border-green-300 bg-green-50"
                                : isRunoffCandidate
                                  ? "border-amber-300 bg-amber-50"
                                  : "bg-white"
                            }`}
                          >
                            <div className="mb-3 flex items-center justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                {candidate.image && (
                                  <img
                                    src={
                                      candidate.image
                                    }
                                    alt=""
                                    className="h-12 w-12 rounded-full object-cover"
                                  />
                                )}

                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">
                                    {
                                      candidate.name
                                    }

                                    {isWinner && (
                                      <span className="ml-2 inline-block rounded-full bg-green-700 px-2 py-0.5 text-xs font-semibold text-white">
                                        Winner
                                      </span>
                                    )}

                                    {!isWinner &&
                                      isRunoffCandidate && (
                                        <span className="ml-2 inline-block rounded-full bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white">
                                          Runoff
                                        </span>
                                      )}
                                  </p>

                                  {candidate.location && (
                                    <p className="text-sm text-slate-500">
                                      {
                                        candidate.location
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-xl font-bold text-slate-900">
                                  {candidate.votes}
                                </p>

                                <p className="text-sm text-slate-500">
                                  {
                                    candidate.percentage
                                  }
                                  %
                                </p>
                              </div>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-green-700 transition-all"
                                style={{
                                  width: `${Math.min(
                                    candidate.percentage,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}