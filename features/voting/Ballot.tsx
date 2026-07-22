import {
    FormEvent,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import type { VerifiedVotingVoter } from "@/features/voting/types";
  import {
    type ElectionCandidate,
    type Id,
    getCandidates,
    submitBallot,
  } from "@/services/electionService";
  
  interface BallotProps {
    voter: VerifiedVotingVoter;
    onSubmitted: (reference?: string) => void;
  }
  
  export default function Ballot({
    voter,
    onSubmitted,
  }: BallotProps) {
    const [candidates, setCandidates] = useState<
      ElectionCandidate[]
    >([]);
    const [selections, setSelections] = useState<
      Record<string, Id>
    >({});
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] =
      useState(true);
    const [isSubmitting, setIsSubmitting] =
      useState(false);
  
    useEffect(() => {
      let isMounted = true;
  
      async function loadCandidates() {
        try {
          setError("");
  
          const response = await getCandidates();
  
          if (isMounted) {
            setCandidates(response.candidates || []);
          }
        } catch (error) {
          if (isMounted) {
            setError(
              error instanceof Error
                ? error.message
                : "Unable to load candidates."
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
  
      loadCandidates();
  
      return () => {
        isMounted = false;
      };
    }, []);
  
    const candidatesByPosition = useMemo(() => {
      return candidates.reduce<
        Record<string, ElectionCandidate[]>
      >((groups, candidate) => {
        const position = candidate.position.trim();
  
        if (!groups[position]) {
          groups[position] = [];
        }
  
        groups[position].push(candidate);
  
        return groups;
      }, {});
    }, [candidates]);
  
    const positions = useMemo(
      () => Object.keys(candidatesByPosition),
      [candidatesByPosition]
    );
  
    async function handleSubmit(
      event: FormEvent<HTMLFormElement>
    ) {
      event.preventDefault();
      setError("");
  
      if (positions.length === 0) {
        setError(
          "There are currently no candidates on this ballot."
        );
        return;
      }
  
      const missingPosition = positions.find(
        (position) =>
          selections[position] === undefined
      );
  
      if (missingPosition) {
        setError(
          `Please select a candidate for ${missingPosition}.`
        );
        return;
      }
  
      const ballotSelections = positions.map(
        (position) => ({
          position,
          candidateId: selections[position],
        })
      );
  
      try {
        setIsSubmitting(true);
  
        const response = await submitBallot(
          voter.id,
          ballotSelections
        );
  
        onSubmitted(response.reference);
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
          <CardContent className="py-12 text-center text-slate-600">
            Loading official ballot...
          </CardContent>
        </Card>
      );
    }
  
    if (error && candidates.length === 0) {
      return (
        <Card>
          <CardContent className="py-12">
            <p
              role="alert"
              className="rounded-md bg-red-50 px-4 py-3 text-center text-sm text-red-700"
            >
              {error}
            </p>
          </CardContent>
        </Card>
      );
    }
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Official Ballot</CardTitle>
  
          <p className="text-sm text-slate-600">
            Voting as{" "}
            <span className="font-semibold text-slate-900">
              {voter.name}
            </span>
            . Select one candidate for each position.
          </p>
        </CardHeader>
  
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-10"
          >
            {positions.map((position) => (
              <fieldset key={position}>
                <legend className="mb-4 text-xl font-bold text-slate-900">
                  {position}
                </legend>
  
                <div className="space-y-3">
                  {candidatesByPosition[position].map(
                    (candidate) => {
                      const isSelected =
                        String(selections[position]) ===
                        String(candidate.id);
  
                      return (
                        <label
                          key={String(candidate.id)}
                          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                            isSelected
                              ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                              : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={position}
                            value={String(candidate.id)}
                            checked={isSelected}
                            onChange={() => {
                              setSelections(
                                (current) => ({
                                  ...current,
                                  [position]:
                                    candidate.id,
                                })
                              );
                              setError("");
                            }}
                            className="h-4 w-4 accent-green-700"
                          />
  
                          {candidate.image && (
                            <img
                              src={candidate.image}
                              alt=""
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          )}
  
                          <span className="min-w-0">
                            <span className="block font-semibold text-slate-900">
                              {candidate.name}
                            </span>
  
                            {candidate.location && (
                              <span className="text-sm text-slate-600">
                                {candidate.location}
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    }
                  )}
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
              disabled={
                isSubmitting ||
                positions.length === 0
              }
            >
              {isSubmitting
                ? "Submitting Ballot..."
                : "Submit Complete Ballot"}
            </Button>
  
            <p className="text-center text-xs text-slate-500">
              Your ballot cannot be changed after it is
              submitted.
            </p>
          </form>
        </CardContent>
      </Card>
    );
  }