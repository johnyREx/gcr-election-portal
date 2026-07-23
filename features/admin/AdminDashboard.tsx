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
  type TurnoutSummary,
  closeElection,
  getAnalytics,
  getElection,
  hideElectionResults,
  openElection,
  publishElectionResults,
  resetElection,
} from "@/services/electionService";

type AdminAction =
  | "open"
  | "close"
  | "publish"
  | "hide"
  | "reset"
  | null;

function getStatusClasses(status?: string) {
  switch (status) {
    case "Open":
      return "bg-green-100 text-green-700";

    case "Closed":
      return "bg-red-100 text-red-700";

    case "Results Published":
      return "bg-blue-100 text-blue-700";

    case "Draft":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminDashboard() {
  const [election, setElection] =
    useState<Election | null>(null);

  const [summary, setSummary] =
    useState<TurnoutSummary | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [activeAction, setActiveAction] =
    useState<AdminAction>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const [
        electionResponse,
        analyticsResponse,
      ] = await Promise.all([
        getElection(),
        getAnalytics(),
      ]);

      setElection(
        electionResponse.election || null
      );

      setSummary(
        analyticsResponse.analytics.summary
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load admin dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function runElectionAction(
    action: Exclude<AdminAction, null>,
    callback: () => Promise<unknown>,
    successText: string
  ) {
    try {
      setActiveAction(action);
      setError("");
      setSuccessMessage("");

      await callback();

      setSuccessMessage(successText);
      await loadDashboard();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to complete the election action."
      );
    } finally {
      setActiveAction(null);
    }
  }

  async function handleOpenElection() {
    const confirmed = window.confirm(
      "Open the election now?\n\nEligible voters will immediately be able to cast ballots."
    );

    if (!confirmed) {
      return;
    }

    await runElectionAction(
      "open",
      openElection,
      "Election opened successfully."
    );
  }

  async function handleCloseElection() {
    const confirmed = window.confirm(
      "Close the election now?\n\nVoters will no longer be able to submit ballots."
    );

    if (!confirmed) {
      return;
    }

    await runElectionAction(
      "close",
      closeElection,
      "Election closed successfully."
    );
  }

  async function handlePublishResults() {
    const confirmed = window.confirm(
      "Publish the election results?\n\nCandidate totals and outcomes will immediately become visible on the public results page."
    );

    if (!confirmed) {
      return;
    }

    await runElectionAction(
      "publish",
      publishElectionResults,
      "Election results published successfully."
    );
  }

  async function handleHideResults() {
    const confirmed = window.confirm(
      "Hide the election results from the public results page?"
    );

    if (!confirmed) {
      return;
    }

    await runElectionAction(
      "hide",
      hideElectionResults,
      "Election results are now hidden."
    );
  }

  async function handleResetElection() {
    const confirmation = window.prompt(
      "This will erase all recorded votes and allow every voter to vote again.\n\nType RESET to continue."
    );

    if (confirmation === null) {
      return;
    }

    if (confirmation.trim() !== "RESET") {
      window.alert(
        "Reset cancelled. You must type RESET exactly."
      );
      return;
    }

    await runElectionAction(
      "reset",
      () => resetElection("RESET"),
      "Election reset successfully."
    );
  }

  if (isLoading) {
    return (
      <Section>
        <Container>
          <p className="text-center text-slate-600">
            Loading admin dashboard...
          </p>
        </Container>
      </Section>
    );
  }

  const isBusy = activeAction !== null;
  const isOpen = election?.status === "Open";
  const isClosed =
    election?.status === "Closed";

  const resultsPublished = Boolean(
    election?.resultsVisible
  );

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              Election Administration
            </p>

            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Election Control Center
            </h1>

            <p className="mt-3 text-slate-600">
              Monitor turnout, control voting and
              manage publication of official results.
            </p>
          </div>

          <AdminLogoutButton />
        </div>

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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Election Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xl font-semibold text-slate-900">
                  {election?.title ||
                    "GCR General Elections 2026"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Election ID:{" "}
                  {election?.id || "gcr-2026"}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                      election?.status
                    )}`}
                  >
                    {election?.status ||
                      "Unknown"}
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
                  onClick={handleOpenElection}
                  disabled={isBusy || isOpen}
                  className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {activeAction === "open"
                    ? "Opening..."
                    : "Open Election"}
                </button>

                <button
                  type="button"
                  onClick={handleCloseElection}
                  disabled={isBusy || isClosed}
                  className="rounded-md bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {activeAction === "close"
                    ? "Closing..."
                    : "Close Election"}
                </button>

                <button
                  type="button"
                  onClick={handlePublishResults}
                  disabled={
                    isBusy || resultsPublished
                  }
                  className="rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {activeAction === "publish"
                    ? "Publishing..."
                    : "Publish Results"}
                </button>

                <button
                  type="button"
                  onClick={handleHideResults}
                  disabled={
                    isBusy || !resultsPublished
                  }
                  className="rounded-md border border-amber-300 px-5 py-3 font-semibold text-amber-800 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {activeAction === "hide"
                    ? "Hiding..."
                    : "Hide Results"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {summary && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                  Votes Cast
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
                  Remaining Voters
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-bold text-slate-900">
                  {summary.remainingVoters}
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
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                Election Operations
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/admin/voters"
                className="rounded-xl border p-5 transition hover:border-green-300 hover:bg-green-50"
              >
                <p className="font-semibold text-slate-900">
                  Manage Voters
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Add, edit and import eligible
                  voters.
                </p>
              </Link>

              <Link
                href="/admin/candidates"
                className="rounded-xl border p-5 transition hover:border-green-300 hover:bg-green-50"
              >
                <p className="font-semibold text-slate-900">
                  Manage Candidates
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Add, edit and organize candidates
                  by position.
                </p>
              </Link>

              <Link
                href="/admin/results"
                className="rounded-xl border p-5 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <p className="font-semibold text-slate-900">
                  Preview Results
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  View administrative results before
                  public publication.
                </p>
              </Link>

              <Link
                href="/results"
                className="rounded-xl border p-5 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <p className="font-semibold text-slate-900">
                  Public Results Page
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Check exactly what the public can
                  currently see.
                </p>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Danger Zone
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-5 text-sm text-slate-600">
                Resetting removes all test vote records
                and clears every voter&apos;s voting
                status.
              </p>

              <button
                type="button"
                onClick={handleResetElection}
                disabled={isBusy}
                className="w-full rounded-md border border-red-300 px-4 py-3 text-left font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeAction === "reset"
                  ? "Resetting election..."
                  : "Reset test election"}
              </button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}