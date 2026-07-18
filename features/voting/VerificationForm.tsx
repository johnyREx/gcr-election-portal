import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  searchVoters,
  verifyVoter,
} from "@/services/electionService";

interface VoterSearchResult {
  id: number;
  name: string;
}

interface VerificationFormProps {
  onVerified: (voterId: number) => void;
}

export default function VerificationForm({
  onVerified,
}: VerificationFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [matchingVoters, setMatchingVoters] = useState<VoterSearchResult[]>(
    []
  );
  const [selectedVoterId, setSelectedVoterId] = useState<number | null>(
    null
  );
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 2 || selectedVoterId !== null) {
      setMatchingVoters([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setError("");

        const response = await searchVoters(query);

        if (!response.success) {
          setError(response.message || "Unable to search for voters.");
          setMatchingVoters([]);
          return;
        }

        setMatchingVoters(response.voters);
      } catch (error) {
        setMatchingVoters([]);
        setError(
          error instanceof Error
            ? error.message
            : "Unable to search for voters."
        );
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchTerm, selectedVoterId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selectedVoterId === null) {
      setError("Please search for and select your name.");
      return;
    }

    if (!dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await verifyVoter(
        selectedVoterId,
        dateOfBirth
      );

      if (!response.success || !response.voter) {
        setError(response.message || "Voter verification failed.");
        return;
      }

      onVerified(response.voter.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Voter verification failed."
      );
    } finally {
      setIsVerifying(false);
    }
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

            {isSearching && (
              <p className="mt-2 text-sm text-slate-500">
                Searching voter register...
              </p>
            )}

            {!isSearching &&
              matchingVoters.length > 0 &&
              selectedVoterId === null && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border bg-white shadow-lg">
                  {matchingVoters.map((voter) => (
                    <button
                      key={voter.id}
                      type="button"
                      className="block w-full border-b px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50"
                      onClick={() => {
                        setSelectedVoterId(voter.id);
                        setSearchTerm(voter.name);
                        setMatchingVoters([]);
                        setError("");
                      }}
                    >
                      {voter.name}
                    </button>
                  ))}
                </div>
              )}

            {!isSearching &&
              searchTerm.trim().length >= 2 &&
              matchingVoters.length === 0 &&
              selectedVoterId === null &&
              !error && (
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

          <Button
            type="submit"
            className="w-full"
            disabled={isVerifying}
          >
            {isVerifying
              ? "Verifying..."
              : "Verify and Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}