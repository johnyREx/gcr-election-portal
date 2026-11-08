"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { config } from "@/lib/config";
import type { VerifiedVotingVoter } from "@/features/voting/types";

import {
  type ElectionCandidate,
  getCandidates,
} from "@/services/electionService";

interface VotingSession {
  token: string;
  expiresAt: string;
}

interface BallotProps {
  voter: VerifiedVotingVoter;
  session: VotingSession;
  onSubmitted: (reference: string) => void;
}

interface BallotSubmissionResponse {
  success: boolean;
  message?: string;
  code?: string;
  reference?: string;
  status?: string;
}

type BallotDecision = "YES" | "NO" | "ABSTAIN" | "SELECT";

interface BallotSelection {
  position: string;
  candidateId: string;
  decision: BallotDecision;
}

const BALLOT_SUBMISSION_ENABLED = true;

const OFFICIAL_POSITIONS = [
  "President",
  "General Secretary",
  "Financial Secretary",
  "Organizing Secretary",
  "Public Relations Officer (PRO)",
  "Women’s Commissioner",
];

function formatRemainingTime(milliseconds: number): string {
  const totalSeconds = Math.max(
    0,
    Math.ceil(milliseconds / 1000)
  );

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

export default function Ballot({
  voter,
  session,
  onSubmitted,
}: BallotProps) {
  const [candidates, setCandidates] = useState<
    ElectionCandidate[]
  >([]);

  const [selections, setSelections] = useState<
    Record<string, BallotSelection>
  >({});

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  const submissionAttempted = useRef(false);

  // =====================================================
  // LOAD CANDIDATES
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadCandidates() {
      try {
        const response = await getCandidates();

        if (mounted) {
          setCandidates(response.candidates || []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load candidates."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadCandidates();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // SESSION TIMER
  // =====================================================

  useEffect(() => {
    const expiry = new Date(session.expiresAt).getTime();

    if (!Number.isFinite(expiry)) {
      setRemainingMs(0);
      return;
    }

    function updateTimer() {
      setRemainingMs(Math.max(0, expiry - Date.now()));
    }

    updateTimer();

    const interval = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(interval);
  }, [session.expiresAt]);

  // =====================================================
  // GROUP CANDIDATES
  // =====================================================

  const candidatesByPosition = useMemo(() => {
    const groups: Record<string, ElectionCandidate[]> = {};

    OFFICIAL_POSITIONS.forEach((position) => {
      groups[position] = [];
    });

    candidates.forEach((candidate) => {
      const position = candidate.position.trim();

      if (groups[position]) {
        groups[position].push(candidate);
      }
    });

    return groups;
  }, [candidates]);

  const configurationValid =
    OFFICIAL_POSITIONS.every(
      (position) => candidatesByPosition[position].length > 0
    ) &&
    candidates.length ===
      OFFICIAL_POSITIONS.reduce(
        (total, position) =>
          total + candidatesByPosition[position].length,
        0
      );

  const sessionValid =
    /^[A-Za-z0-9_-]{43}$/.test(session.token) &&
    remainingMs > 0;

  const missingPosition = OFFICIAL_POSITIONS.find(
    (position) => !selections[position]
  );

  const ballotComplete =
    configurationValid && !missingPosition;

  const canProceed =
    BALLOT_SUBMISSION_ENABLED &&
    sessionValid &&
    ballotComplete &&
    !isSubmitting &&
    !submissionAttempted.current;

  // =====================================================
  // SELECT DECISION
  // =====================================================

  function selectDecision(
    position: string,
    candidateId: string,
    decision: BallotDecision
  ) {
    setSelections((current) => ({
      ...current,
      [position]: {
        position,
        candidateId,
        decision,
      },
    }));

    setError("");
  }

  // =====================================================
  // REVIEW BALLOT
  // =====================================================

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canProceed) {
      setError(
        "Please complete all six electoral positions before continuing."
      );
      return;
    }

    setError("");
    setIsReviewing(true);
  }

  // =====================================================
  // SUBMIT BALLOT
  // =====================================================

  async function handleSubmit() {
    if (!canProceed) {
      return;
    }

    const ballotSelections = OFFICIAL_POSITIONS.map(
      (position) => selections[position]
    );

    submissionAttempted.current = true;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/election", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          action: "submitBallot",
          electionId: config.electionId,
          sessionToken: session.token,
          selections: ballotSelections,
        }),
      });

      const data =
        (await response.json()) as BallotSubmissionResponse;

      if (!response.ok || !data.success) {
        switch (data.code) {
          case "BALLOT_SUBMISSION_DISABLED":
          case "ELECTION_NOT_OPEN":
          case "INVALID_TEST_ELECTION":
            setError(
              "Voting is not currently available for this election."
            );
            submissionAttempted.current = false;
            break;

          case "INVALID_SESSION":
            setError(
              "Your voting session is invalid or expired. Please verify again."
            );
            break;

          case "ALREADY_VOTED":
            setError(
              "A ballot has already been submitted using this voter credential."
            );
            break;

          case "INCOMPLETE_BALLOT":
          case "INVALID_BALLOT":
          case "INVALID_SELECTION":
          case "DUPLICATE_POSITION":
          case "INVALID_DECISION":
          case "INVALID_CANDIDATE":
          case "INVALID_ABSTENTION":
            setError(
              data.message ||
                "Please review your ballot selections."
            );
            submissionAttempted.current = false;
            setIsReviewing(false);
            break;

          case "SUBMISSION_REQUIRES_REVIEW":
            setError(
              "Your submission could not be confirmed. Do not vote again. Contact the Electoral Commission."
            );
            break;

          default:
            setError(
              data.message ||
                "Unable to confirm your submission. Contact the Electoral Commission before trying again."
            );
        }

        return;
      }

      if (
        data.status !== "COMMITTED" ||
        typeof data.reference !== "string" ||
        !data.reference.startsWith("ballot-")
      ) {
        setError(
          "The server did not confirm your ballot. Contact the Electoral Commission before trying again."
        );
        return;
      }

      onSubmitted(data.reference);
    } catch {
      setError(
        "The submission result could not be confirmed. Do not vote again until the Electoral Commission checks your ballot status."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-600">
          Loading official ballot...
        </CardContent>
      </Card>
    );
  }

  if (!configurationValid) {
    return (
      <Card>
        <CardContent className="py-12">
          <p
            role="alert"
            className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900"
          >
            {error ||
              "The ballot is not fully configured. Please contact the Electoral Commission."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // =====================================================
  // BALLOT REVIEW SCREEN
  // =====================================================

  if (isReviewing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Your Ballot</CardTitle>
          <p className="text-sm text-slate-600">
            Please confirm your decisions before submitting.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {OFFICIAL_POSITIONS.map((position) => {
            const selection = selections[position];

            const candidate = candidatesByPosition[
              position
            ].find(
              (item) =>
                String(item.id) === selection.candidateId
            );

            return (
              <div
                key={position}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h3 className="font-semibold text-slate-900">
                  {position}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {candidate?.name ||
                    (selection.decision === "ABSTAIN"
                      ? "No candidate selected"
                      : "Unknown candidate")}
                </p>

                <p className="mt-2 font-bold text-green-700">
                  {selection.decision}
                </p>
              </div>
            );
          })}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={
                isSubmitting || submissionAttempted.current
              }
              onClick={() => setIsReviewing(false)}
              className="flex-1"
            >
              Edit Ballot
            </Button>

            <Button
              type="button"
              disabled={!canProceed}
              onClick={handleSubmit}
              className="flex-1 bg-green-700 hover:bg-green-800"
            >
              <LockKeyhole className="mr-2 h-4 w-4" />

              {isSubmitting
                ? "Submitting..."
                : "Confirm & Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // =====================================================
  // BALLOT FORM
  // =====================================================

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Official Ballot</CardTitle>

        <p className="text-sm text-slate-600">
          Voting as{" "}
          <span className="font-semibold text-slate-900">
            {voter.name}
          </span>
          . Complete all six positions.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <Clock3 className="h-4 w-4" />
            Session time remaining
          </div>

          <span className="font-mono text-sm font-bold text-green-900">
            {formatRemainingTime(remainingMs)}
          </span>
        </div>

        {!sessionValid && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"
          >
            Your voting session has expired. Please verify again.
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleReview}
          className="space-y-10"
        >
          {OFFICIAL_POSITIONS.map((position) => {
            const contestCandidates =
              candidatesByPosition[position];

            const unopposed =
              contestCandidates.length === 1;

            return (
              <fieldset
                key={position}
                disabled={
                  !sessionValid || isSubmitting
                }
              >
                <legend className="mb-4 text-xl font-bold text-slate-900">
                  {position}
                </legend>

                {unopposed ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {contestCandidates[0].name}
                      </p>

                      {contestCandidates[0].runningMate && (
                        <p className="mt-1 text-sm text-slate-600">
                          Running Mate:{" "}
                          {contestCandidates[0].runningMate}
                        </p>
                      )}

                      {contestCandidates[0].location && (
                        <p className="mt-1 text-sm text-slate-500">
                          {contestCandidates[0].location}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {(["YES", "NO", "ABSTAIN"] as const).map(
                        (decision) => {
                          const selected =
                            selections[position]?.decision ===
                            decision;

                          return (
                            <label
                              key={decision}
                              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 font-semibold transition ${
                                selected
                                  ? "border-green-700 bg-green-50 text-green-800 ring-1 ring-green-700"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={position}
                                checked={selected}
                                onChange={() =>
                                  selectDecision(
                                    position,
                                    String(contestCandidates[0].id),
                                    decision
                                  )
                                }
                                className="accent-green-700"
                              />

                              {decision}
                            </label>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contestCandidates.map((candidate) => {
                      const selected =
                        selections[position]?.decision ===
                          "SELECT" &&
                        selections[position]?.candidateId ===
                          String(candidate.id);

                      return (
                        <label
                          key={String(candidate.id)}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                            selected
                              ? "border-green-700 bg-green-50"
                              : "border-slate-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name={position}
                            checked={selected}
                            onChange={() =>
                              selectDecision(
                                position,
                                String(candidate.id),
                                "SELECT"
                              )
                            }
                            className="accent-green-700"
                          />

                          <span className="font-medium">
                            {candidate.name}
                          </span>
                        </label>
                      );
                    })}

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                      <input
                        type="radio"
                        name={position}
                        checked={
                          selections[position]?.decision ===
                          "ABSTAIN"
                        }
                        onChange={() =>
                          selectDecision(position, "", "ABSTAIN")
                        }
                        className="accent-green-700"
                      />

                      <span className="font-medium">
                        ABSTAIN
                      </span>
                    </label>
                  </div>
                )}
              </fieldset>
            );
          })}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={!canProceed}
            className="h-12 w-full bg-green-700 text-base font-semibold hover:bg-green-800"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Review Ballot
          </Button>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

              <p className="text-xs leading-5 text-slate-600">
                Your vote is submitted using a secure voting
                session. You may submit only one complete ballot.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}