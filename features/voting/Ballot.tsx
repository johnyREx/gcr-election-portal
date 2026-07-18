import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { candidates } from "@/constants/candidates";
import { submitVote } from "@/services/electionService";

interface BallotProps {
  voterId: number;
  onSubmitted: () => void;
}

export default function Ballot({
  voterId,
  onSubmitted,
}: BallotProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presidentialCandidates = candidates.filter(
    (candidate) => candidate.position === "President"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedCandidateId) {
      setError("Please select a candidate.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await submitVote(
        voterId,
        Number(selectedCandidateId)
      );

      if (!response.success) {
        setError(response.message || "Unable to submit your vote.");
        return;
      }

      onSubmitted();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit your vote."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presidential Ballot</CardTitle>

        <p className="text-sm text-slate-600">
          Your identity has been verified. Select one candidate.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            {presidentialCandidates.map((candidate) => (
              <label
                key={candidate.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  selectedCandidateId === String(candidate.id)
                    ? "border-green-700 bg-green-50"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="candidate"
                  value={candidate.id}
                  checked={
                    selectedCandidateId === String(candidate.id)
                  }
                  onChange={(event) => {
                    setSelectedCandidateId(event.target.value);
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
            ))}
          </div>

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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting Vote..." : "Submit Vote"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}