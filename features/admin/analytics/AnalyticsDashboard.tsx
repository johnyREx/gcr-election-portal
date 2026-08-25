"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  type ElectionAnalytics,
  getAnalytics,
} from "@/services/electionService";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] =
    useState<ElectionAnalytics | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        }

        setError("");

        const response = await getAnalytics();

        setAnalytics(response.analytics);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load election analytics."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (isLoading) {
    return (
      <Section className="bg-slate-50">
        <Container>
          <p className="text-center text-slate-600">
            Loading election analytics...
          </p>
        </Container>
      </Section>
    );
  }

  const summary = analytics?.summary;

  return (
    <Section className="min-h-screen bg-slate-50">
      <Container>
        {/* Header */}

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-green-700 hover:underline"
            >
              ← Back to Admin Dashboard
            </Link>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              Election Intelligence
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              Election Analytics
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Monitor voter participation, turnout,
              demographic distribution and voting activity
              during the election.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAnalytics(true)}
            disabled={isRefreshing}
            className="rounded-md border bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRefreshing
              ? "Refreshing..."
              : "Refresh Analytics"}
          </button>
        </div>

        {/* Error */}

        {error && (
          <div
            role="alert"
            className="mb-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700"
          >
            {error}
          </div>
        )}

        {!analytics ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-600">
              Election analytics are currently unavailable.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary */}

            {summary && (
              <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  title="Registered Voters"
                  value={summary.registeredVoters}
                  description="Eligible voters"
                />

                <SummaryCard
                  title="Votes Cast"
                  value={summary.votesCast}
                  description="Voters who participated"
                />

                <SummaryCard
                  title="Remaining"
                  value={summary.remainingVoters}
                  description="Yet to vote"
                />

                <SummaryCard
                  title="Turnout"
                  value={`${summary.turnoutPercentage}%`}
                  description="Overall participation"
                  highlight
                />
              </div>
            )}

            {/* Gender + voting activity */}

            <div className="mb-8 grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Turnout by Gender</CardTitle>

                  <p className="text-sm text-slate-500">
                    Participation across registered voter
                    gender groups.
                  </p>
                </CardHeader>

                <CardContent>
                  {analytics.gender.length === 0 ? (
                    <EmptyMessage message="No gender information available." />
                  ) : (
                    <div className="space-y-6">
                      {analytics.gender.map((group) => (
                        <TurnoutRow
                          key={group.gender}
                          label={group.gender}
                          registered={group.registered}
                          voted={group.voted}
                          remaining={group.remaining}
                          percentage={
                            group.turnoutPercentage
                          }
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Voting Activity</CardTitle>

                  <p className="text-sm text-slate-500">
                    Ballots submitted by hour.
                  </p>
                </CardHeader>

                <CardContent>
                  {analytics.votingActivity.length ===
                  0 ? (
                    <EmptyMessage message="No voting activity recorded yet." />
                  ) : (
                    <div className="space-y-3">
                      {analytics.votingActivity.map(
                        (activity) => (
                          <div
                            key={activity.hour}
                            className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
                          >
                            <div>
                              <p className="font-medium text-slate-900">
                                {formatActivityHour(
                                  activity.hour
                                )}
                              </p>

                              <p className="text-xs text-slate-500">
                                Voting period
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xl font-bold text-green-700">
                                {activity.votes}
                              </p>

                              <p className="text-xs text-slate-500">
                                {activity.votes === 1
                                  ? "vote"
                                  : "votes"}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Location analytics */}

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  Turnout by Location
                </CardTitle>

                <p className="text-sm text-slate-500">
                  Registered voters and participation across
                  community locations.
                </p>
              </CardHeader>

              <CardContent>
                {analytics.locations.length === 0 ? (
                  <EmptyMessage message="No voter location information available." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead>
                        <tr className="border-b text-sm text-slate-500">
                          <th className="pb-4 font-medium">
                            Location
                          </th>

                          <th className="pb-4 font-medium">
                            Registered
                          </th>

                          <th className="pb-4 font-medium">
                            Voted
                          </th>

                          <th className="pb-4 font-medium">
                            Remaining
                          </th>

                          <th className="pb-4 font-medium">
                            Turnout
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {analytics.locations.map(
                          (location) => (
                            <tr
                              key={location.location}
                              className="border-b last:border-0"
                            >
                              <td className="py-5 font-semibold text-slate-900">
                                {location.location}
                              </td>

                              <td className="py-5">
                                {location.registered}
                              </td>

                              <td className="py-5">
                                {location.voted}
                              </td>

                              <td className="py-5">
                                {location.remaining}
                              </td>

                              <td className="py-5">
                                <div className="flex items-center gap-3">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                      className="h-full rounded-full bg-green-600"
                                      style={{
                                        width: `${Math.min(
                                          location.turnoutPercentage,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="font-semibold text-slate-900">
                                    {
                                      location.turnoutPercentage
                                    }
                                    %
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate analytics */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Candidate Performance Analysis
                </CardTitle>

                <p className="text-sm text-slate-500">
                  Candidate vote distribution by voter
                  location.
                </p>
              </CardHeader>

              <CardContent>
                {!analytics.resultsVisible ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                    <p className="font-semibold text-amber-900">
                      Candidate analytics are locked
                    </p>

                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Candidate-level performance is hidden
                      while official results remain
                      unpublished. This prevents live vote
                      totals from influencing the election.
                    </p>
                  </div>
                ) : !analytics.candidateBreakdown ||
                  analytics.candidateBreakdown.length ===
                    0 ? (
                  <EmptyMessage message="No candidate performance data available." />
                ) : (
                  <div className="space-y-10">
                    {analytics.candidateBreakdown.map(
                      (position) => (
                        <div key={position.position}>
                          <h3 className="mb-5 text-xl font-bold text-slate-900">
                            {position.position}
                          </h3>

                          <div className="grid gap-5 lg:grid-cols-2">
                            {position.candidates.map(
                              (candidate) => (
                                <div
                                  key={candidate.id}
                                  className="rounded-xl border bg-white p-5"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="font-bold text-slate-900">
                                        {candidate.name}
                                      </p>

                                      <p className="mt-1 text-sm text-slate-500">
                                        Total votes
                                      </p>
                                    </div>

                                    <p className="text-3xl font-bold text-green-700">
                                      {
                                        candidate.totalVotes
                                      }
                                    </p>
                                  </div>

                                  <div className="mt-5 border-t pt-4">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                      Votes by location
                                    </p>

                                    {candidate.locations
                                      .length === 0 ? (
                                      <p className="text-sm text-slate-500">
                                        No location data.
                                      </p>
                                    ) : (
                                      <div className="space-y-2">
                                        {candidate.locations.map(
                                          (location) => (
                                            <div
                                              key={
                                                location.location
                                              }
                                              className="flex justify-between text-sm"
                                            >
                                              <span className="text-slate-600">
                                                {
                                                  location.location
                                                }
                                              </span>

                                              <span className="font-semibold text-slate-900">
                                                {
                                                  location.votes
                                                }
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Section>
  );
}

function SummaryCard({
  title,
  value,
  description,
  highlight = false,
}: {
  title: string;
  value: number | string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <p
          className={`mt-3 text-4xl font-bold ${
            highlight
              ? "text-green-700"
              : "text-slate-900"
          }`}
        >
          {value}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function TurnoutRow({
  label,
  registered,
  voted,
  remaining,
  percentage,
}: {
  label: string;
  registered: number;
  voted: number;
  remaining: number;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="font-semibold text-slate-900">
          {label}
        </p>

        <p className="font-bold text-green-700">
          {percentage}%
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-green-600"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>Registered: {registered}</span>
        <span>Voted: {voted}</span>
        <span>Remaining: {remaining}</span>
      </div>
    </div>
  );
}

function EmptyMessage({
  message,
}: {
  message: string;
}) {
  return (
    <p className="py-6 text-center text-sm text-slate-500">
      {message}
    </p>
  );
}

function formatActivityHour(value: string) {
  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}