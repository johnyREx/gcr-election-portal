"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import AdminLogoutButton from "@/features/admin/AdminLogoutButton";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  type Election,
  type ElectionReadiness,
  type TurnoutSummary,
  closeElection,
  getAnalytics,
  getElection,
  getElectionReadiness,
} from "@/services/electionService";

function getStatusClasses(status?: string) {
  switch (status) {
    case "Open":
      return "bg-green-100 text-green-700";

    case "Closed":
      return "bg-red-100 text-red-700";

    case "Results Published":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminDashboard() {
  const [election, setElection] =
    useState<Election | null>(null);

  const [summary, setSummary] =
    useState<TurnoutSummary | null>(null);

  const [readiness, setReadiness] =
    useState<ElectionReadiness | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isClosing, setIsClosing] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const [
        electionResponse,
        analyticsResponse,
        readinessResponse,
      ] = await Promise.all([
        getElection(),
        getAnalytics(),
        getElectionReadiness(),
      ]);

      setElection(
        electionResponse.election || null
      );

      setSummary(
        analyticsResponse.analytics.summary
      );

      setReadiness(
        readinessResponse.readiness
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleRefresh() {
    setIsRefreshing(true);

    await loadDashboard();

    setIsRefreshing(false);
  }

  async function handleCloseElection() {
    if (election?.status !== "Open") {
      return;
    }

    const confirmed = window.confirm(
      "Close this election?\n\nVoters will no longer be able to submit ballots."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsClosing(true);
      setError("");
      setSuccessMessage("");

      await closeElection();

      setSuccessMessage(
        "Election closed successfully."
      );

      await loadDashboard();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to close election."
      );
    } finally {
      setIsClosing(false);
    }
  }

  if (isLoading) {
    return (
      <Section>
        <Container>
          <p className="text-center text-slate-600">
            Loading election administration...
          </p>
        </Container>
      </Section>
    );
  }

  const isDraft = election?.status === "Draft";
  const isOpen = election?.status === "Open";

  const resultsPublished = Boolean(
    election?.resultsVisible
  );

  const registeredVoters =
    readiness?.registeredVoters ?? 0;

  const registeredCandidates =
    readiness?.registeredCandidates ?? 0;

  const accessCodesIssued =
    readiness?.accessCodesIssued ?? 0;

  const accessCodesRequired =
    readiness?.accessCodesRequired ?? 0;

  const accessCodeProgress =
    accessCodesRequired > 0
      ? Math.min(
          100,
          (accessCodesIssued /
            accessCodesRequired) *
            100
        )
      : 0;

  return (
    <Section className="bg-slate-50">
      <Container>
        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              Election Administration
            </p>

            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Election Control Center
            </h1>

            <p className="mt-3 text-slate-600">
              Manage election readiness, monitor
              turnout and oversee election operations.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <AdminLogoutButton />
          </div>
        </div>

        {/* MESSAGES */}

        {error && (
          <div
            role="alert"
            className="mb-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-8 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}

        {/* ELECTION STATUS */}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Election Status</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {election?.title ||
                    "Election unavailable"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Election ID:{" "}
                  {election?.id || "Unavailable"}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                      election?.status
                    )}`}
                  >
                    {election?.status || "Unknown"}
                  </span>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      resultsPublished
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    Results:{" "}
                    {resultsPublished
                      ? "Published"
                      : "Hidden"}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled
                  title="Election opening is disabled pending security verification."
                  className="cursor-not-allowed rounded-md bg-green-700 px-5 py-3 font-semibold text-white opacity-50"
                >
                  Open Election
                </button>

                <button
                  type="button"
                  onClick={handleCloseElection}
                  disabled={!isOpen || isClosing}
                  className="rounded-md bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isClosing
                    ? "Closing..."
                    : "Close Election"}
                </button>

                <button
                  type="button"
                  disabled
                  title="Results certification has not been implemented."
                  className="cursor-not-allowed rounded-md bg-blue-700 px-5 py-3 font-semibold text-white opacity-50"
                >
                  Publish Results
                </button>

                <button
                  type="button"
                  disabled
                  title="Published results cannot be silently hidden."
                  className="cursor-not-allowed rounded-md border border-amber-300 px-5 py-3 font-semibold text-amber-800 opacity-50"
                >
                  Hide Results
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* READINESS */}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Election Readiness
            </CardTitle>
          </CardHeader>

          <CardContent>
            {!readiness ? (
              <p className="text-slate-500">
                Readiness information is unavailable.
              </p>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      readiness.ready
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {readiness.ready
                      ? "Ready to Open"
                      : "Not Ready"}
                  </span>

                  {!readiness.openingEnabled && (
                    <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                      Security Lock Active
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      Registered Voters
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {registeredVoters}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      Candidates
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {registeredCandidates}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      Access Codes
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {accessCodesIssued}
                      <span className="text-lg text-slate-400">
                        /{accessCodesRequired}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Access-code distribution
                    </span>

                    <span className="text-slate-500">
                      {Math.round(accessCodeProgress)}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all"
                      style={{
                        width: `${accessCodeProgress}%`,
                      }}
                    />
                  </div>
                </div>

                {readiness.issues.length > 0 && (
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <h3 className="font-semibold text-amber-900">
                      Outstanding Requirements
                    </h3>

                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-900">
                      {readiness.issues.map(
                        (issue, index) => (
                          <li key={`${issue}-${index}`}>
                            {issue}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {isDraft && (
                  <div className="mt-6">
                    <Link
                      href="/admin/voters"
                      className="inline-flex rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
                    >
                      Manage Voter Access Codes →
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* TURNOUT */}

        {summary && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Registered Voters",
                value: summary.registeredVoters,
              },
              {
                label: "Votes Cast",
                value: summary.votesCast,
              },
              {
                label: "Remaining Voters",
                value: summary.remainingVoters,
              },
              {
                label: "Turnout",
                value: `${summary.turnoutPercentage}%`,
              },
            ].map((item) => (
              <Card key={item.label}>
                <CardHeader>
                  <CardTitle className="text-base text-slate-600">
                    {item.label}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-4xl font-bold text-slate-900">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* OPERATIONS */}

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                Election Operations
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  href: "/admin/voters",
                  title: "Manage Voters",
                  description:
                    "Manage registered voters and access codes.",
                },
                {
                  href: "/admin/candidates",
                  title: "Manage Candidates",
                  description:
                    "Manage candidates, positions and running mates.",
                },
                {
                  href: "/admin/results",
                  title: "Preview Results",
                  description:
                    "View administrative election results.",
                },
                {
                  href: "/results",
                  title: "Public Results",
                  description:
                    "Preview the public results page.",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border p-5 transition hover:border-green-300 hover:bg-green-50"
                >
                  <p className="font-semibold text-slate-900">
                    {item.title}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.description}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                System Security
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-slate-600">
                Election opening, voting and results
                publication remain restricted until
                their security and integrity checks
                are complete.
              </p>

              <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm font-medium text-amber-800">
                Protected election controls are
                currently locked.
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}