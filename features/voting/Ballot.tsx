import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { candidates } from "@/constants/candidates";
import { voters } from "@/constants/voters";

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

  const voter = voters.find((item) => item.id === voterId);

  const presidentialCandidates = candidates.filter(
    (candidate) => candidate.position === "President"
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!voter) {
      setError("The verified voter could not be found.");
      return;
    }

    if (!selectedCandidateId) {
      setError("Please select a candidate.");
      return;
    }

    const hasAlreadyVoted =
      localStorage.getItem(`gcr-voted-${voter.id}`) === "true";

    if (hasAlreadyVoted) {
      setError("This voter has already cast a vote.");
      return;
    }

    const storedVotes = JSON.parse(
      localStorage.getItem("gcr-test-votes") ?? "[]"
    );

    storedVotes.push({
      electionId: "gcr-2026",
      position: "President",
      candidateId: Number(selectedCandidateId),
      submittedAt: new Date().toISOString(),
    });

    localStorage.setItem(
      "gcr-test-votes",
      JSON.stringify(storedVotes)
    );

    localStorage.setItem(`gcr-voted-${voter.id}`, "true");

    onSubmitted();
  }

  if (!voter) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presidential Ballot</CardTitle>

        <p className="text-sm text-slate-600">
          Verified voter: {voter.name}
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

          <Button type="submit" className="w-full">
            Submit Vote
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}