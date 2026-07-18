import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { voters } from "@/constants/voters";

interface VerificationFormProps {
  onVerified: (voterId: number) => void;
}

export default function VerificationForm({
  onVerified,
}: VerificationFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVoterId, setSelectedVoterId] = useState<number | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");

  const matchingVoters = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (query.length < 2) {
      return [];
    }

    return voters
      .filter((voter) => voter.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchTerm]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const selectedVoter = voters.find(
      (voter) => voter.id === selectedVoterId
    );

    if (!selectedVoter) {
      setError("Please search for and select your name.");
      return;
    }

    const hasAlreadyVoted =
      localStorage.getItem(`gcr-voted-${selectedVoter.id}`) === "true";

    if (hasAlreadyVoted) {
      setError("This voter has already cast a vote.");
      return;
    }

    if (selectedVoter.dateOfBirth !== dateOfBirth) {
      setError("The date of birth entered does not match our records.");
      return;
    }

    onVerified(selectedVoter.id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voter Verification</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label
              htmlFor="voter-search"
              className="mb-2 block text-sm font-medium"
            >
              Search your name
            </label>

            <Input
              id="voter-search"
              type="search"
              placeholder="Start typing your full name"
              value={searchTerm}
              autoComplete="off"
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSelectedVoterId(null);
                setError("");
              }}
            />

            {matchingVoters.length > 0 && selectedVoterId === null && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border bg-white shadow-lg">
                {matchingVoters.map((voter) => (
                  <button
                    key={voter.id}
                    type="button"
                    className="block w-full border-b px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50"
                    onClick={() => {
                      setSelectedVoterId(voter.id);
                      setSearchTerm(voter.name);
                      setError("");
                    }}
                  >
                    {voter.name}
                  </button>
                ))}
              </div>
            )}

            {searchTerm.length >= 2 &&
              matchingVoters.length === 0 &&
              selectedVoterId === null && (
                <p className="mt-2 text-sm text-slate-500">
                  No matching voter found.
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="dob"
              className="mb-2 block text-sm font-medium"
            >
              Date of birth
            </label>

            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(event) => {
                setDateOfBirth(event.target.value);
                setError("");
              }}
            />
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
            Verify and Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}