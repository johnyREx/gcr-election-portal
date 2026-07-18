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
  getResults,
  resetElection,
  PositionResult,
  ResultsSummary,
} from "@/services/electionService";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<ResultsSummary | null>(null);
  const [results, setResults] = useState<PositionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getResults();

        if (!response.success) {
          setError(response.message || "Unable to load admin dashboard.");
          return;
        }

        setSummary(response.summary);
        setResults(response.results);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load admin dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleResetElection() {
    const confirmation = window.prompt(
      "This will erase ALL votes and allow every voter to vote again.\n\nType RESET to continue."
    );

    if (confirmation === null) {
      return;
    }

    if (confirmation.trim() !== "RESET") {
      window.alert("Reset cancelled. You must type RESET exactly.");
      return;
    }

    try {
      setIsResetting(true);

      const response = await resetElection(confirmation.trim());

      if (!response.success) {
        window.alert(response.message || "Unable to reset election.");
        return;
      }

      window.alert("Election reset successfully.");
      window.location.reload();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to reset election."
      );
    } finally {
      setIsResetting(false);
    }
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

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Election Administration
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-slate-600">
            Monitor the current election and manage election operations.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-md bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Election</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  GCR General Elections 2026
                </p>

                <p className="text-sm text-slate-500">
                  Election ID: gcr-2026
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                Open
              </span>
            </div>
          </CardContent>
        </Card>

        {summary && (
          <div className="mb-8 grid gap-6 sm:grid-cols-3">
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
              <CardTitle>Election Overview</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              {results.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No election positions found.
                </p>
              ) : (
                results.map((result) => (
                  <div
                    key={result.position}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {result.position}
                      </p>

                      <p className="text-sm text-slate-500">
                        {result.candidates.length} candidates
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900">
                      {result.totalVotes} votes
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <button
                type="button"
                className="w-full rounded-md border px-4 py-3 text-left font-medium hover:bg-slate-50"
              >
                Manage voters
              </button>

              <button
                type="button"
                className="w-full rounded-md border px-4 py-3 text-left font-medium hover:bg-slate-50"
              >
                Manage candidates
              </button>

              <button
                type="button"
                className="w-full rounded-md border px-4 py-3 text-left font-medium hover:bg-slate-50"
              >
                Open or close election
              </button>

              <button
                type="button"
                onClick={handleResetElection}
                disabled={isResetting}
                className="w-full rounded-md border border-red-200 px-4 py-3 text-left font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResetting
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