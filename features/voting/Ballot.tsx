import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ElectionCandidate,
  getCandidates,
  submitBallot,
} from "@/services/electionService";

interface BallotProps {
  voterId: number;
  onSubmitted: () => void;
}

export default function Ballot({
  voterId,
  onSubmitted,
}: BallotProps) {
  const [candidates, setCandidates] = useState<ElectionCandidate[]>([]);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCandidates() {
      try {
        const response = await getCandidates();

        if (!response.success) {
          setError(response.message || "Unable to load candidates.");
          return;
        }

        setCandidates(response.candidates);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load candidates."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCandidates();
  }, []);

  const candidatesByPosition = useMemo(() => {
    return candidates.reduce<Record<string, ElectionCandidate[]>>(
      (groups, candidate) => {
        if (!groups[candidate.position]) {
          groups[candidate.position] = [];
        }

        groups[candidate.position].push(candidate);
        return groups;
      },
      {}
    );
  }, [candidates]);

  const positions = Object.keys(candidatesByPosition);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const missingPosition = positions.find(
      (position) => !selections[position]
    );

    if (missingPosition) {
      setError(`Please select a candidate for ${missingPosition}.`);
      return;
    }

    const ballotSelections = positions.map((position) => ({
      position,
      candidateId: selections[position],
    }));

    try {
      setIsSubmitting(true);

      const response = await submitBallot(
        voterId,
        ballotSelections
      );

      if (!response.success) {
        setError(response.message || "Unable to submit your ballot.");
        return;
      }

      onSubmitted();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit your ballot."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          Loading ballot...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Official Ballot</CardTitle>

        <p className="text-sm text-slate-600">
          Select one candidate for each position.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-10">
          {positions.map((position) => (
            <fieldset key={position}>
              <legend className="mb-4 text-xl font-bold text-slate-900">
                {position}
              </legend>

              <div className="space-y-3">
                {candidatesByPosition[position].map((candidate) => {
                  const isSelected =
                    selections[position] === candidate.id;

                  return (
                    <label
                      key={candidate.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                        isSelected
                          ? "border-green-700 bg-green-50"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={position}
                        value={candidate.id}
                        checked={isSelected}
                        onChange={() => {
                          setSelections((current) => ({
                            ...current,
                            [position]: candidate.id,
                          }));
                          setError("");
                        }}
                      />

                      <span>
                        <span className="block font-semibold text-slate-900">
                          {candidate.name}
                        </span>

                        <span className="text-sm text-slate-600">
                          {candidate.location}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || positions.length === 0}
          >
            {isSubmitting
              ? "Submitting Ballot..."
              : "Submit Complete Ballot"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}