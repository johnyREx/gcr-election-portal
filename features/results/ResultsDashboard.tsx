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
  PositionResult,
  ResultsSummary,
} from "@/services/electionService";

export default function ResultsDashboard() {
  const [summary, setSummary] = useState<ResultsSummary | null>(null);
  const [results, setResults] = useState<PositionResult[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await getResults();

        if (!response.success) {
          setError(response.message || "Unable to load election results.");
          return;
        }

        setSummary(response.summary);
        setResults(response.results);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load election results."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, []);

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
            Live test results and voter turnout for the current election.
          </p>
        </div>

        {error && (
          <p className="mb-8 rounded-md bg-red-50 px-4 py-3 text-red-700">
            {error}
          </p>
        )}

        {summary && (
          <div className="mb-12 grid gap-6 sm:grid-cols-3">
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

        <div className="space-y-10">
          {results.map((result) => (
            <Card key={result.position}>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {result.position}
                </CardTitle>

                <p className="text-sm text-slate-500">
                  {result.totalVotes} total votes
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {result.candidates.map((candidate, index) => (
                  <div key={candidate.id}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {candidate.name}
                          {index === 0 && candidate.votes > 0 && (
                            <span className="ml-2 text-sm font-medium text-green-700">
                              Leading
                            </span>
                          )}
                        </p>

                        <p className="text-sm text-slate-500">
                          {candidate.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {candidate.votes}
                        </p>

                        <p className="text-sm text-slate-500">
                          {candidate.percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-green-700 transition-all"
                        style={{
                          width: `${candidate.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}