"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
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

import type {
  VerifiedVotingVoter,
} from "@/features/voting/types";

import {
  type ElectionCandidate,
  type Id,
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

interface BallotSelection {
  position: string;
  candidateId: string;
}

/**
 * Frontend safety switch.
 *
 * Keep false until the TEST election is
 * deliberately opened for integration testing.
 *
 * The backend independently enforces its
 * own submission switch.
 */
const BALLOT_SUBMISSION_ENABLED = false;

function formatRemainingTime(
  milliseconds: number
): string {
  const totalSeconds = Math.max(
    0,
    Math.ceil(milliseconds / 1000)
  );

  const minutes = Math.floor(
    totalSeconds / 60
  );

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
    Record<string, Id>
  >({});

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [remainingMs, setRemainingMs] =
    useState(0);

  const submissionAttempted = useRef(false);

  // =====================================================
  // LOAD CANDIDATES
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    async function loadCandidates() {
      try {
        setError("");

        const response =
          await getCandidates();

        if (isMounted) {
          setCandidates(
            response.candidates || []
          );
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

  // =====================================================
  // SESSION COUNTDOWN
  // =====================================================

  useEffect(() => {
    const expiryTime = new Date(
      session.expiresAt
    ).getTime();

    if (!Number.isFinite(expiryTime)) {
      setRemainingMs(0);
      return;
    }

    const updateRemainingTime = () => {
      setRemainingMs(
        Math.max(
          0,
          expiryTime - Date.now()
        )
      );
    };

    updateRemainingTime();

    const interval =
      window.setInterval(
        updateRemainingTime,
        1000
      );

    return () => {
      window.clearInterval(interval);
    };
  }, [session.expiresAt]);

  // =====================================================
  // GROUP CANDIDATES
  // =====================================================

  const candidatesByPosition =
    useMemo(() => {
      return candidates.reduce<
        Record<
          string,
          ElectionCandidate[]
        >
      >((groups, candidate) => {
        const position =
          candidate.position.trim();

        if (!groups[position]) {
          groups[position] = [];
        }

        groups[position].push(
          candidate
        );

        return groups;
      }, {});
    }, [candidates]);

  const positions = useMemo(
    () =>
      Object.keys(
        candidatesByPosition
      ),
    [candidatesByPosition]
  );

  const missingPosition =
    positions.find(
      (position) =>
        selections[position] ===
        undefined
    );

  const sessionValid =
    /^[A-Za-z0-9_-]{43}$/.test(
      session.token
    ) &&
    remainingMs > 0;

  const ballotComplete =
    positions.length > 0 &&
    !missingPosition;

  const canSubmit =
    BALLOT_SUBMISSION_ENABLED &&
    sessionValid &&
    ballotComplete &&
    !isSubmitting &&
    !submissionAttempted.current;

  // =====================================================
  // SUBMIT BALLOT
  // =====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!BALLOT_SUBMISSION_ENABLED) {
      setError(
        "Ballot submission is not enabled yet."
      );
      return;
    }

    if (
      isSubmitting ||
      submissionAttempted.current
    ) {
      return;
    }

    if (!sessionValid) {
      setError(
        "Your voting session has expired. Please verify your access code again."
      );
      return;
    }

    if (
      positions.length === 0
    ) {
      setError(
        "There are no candidates on this ballot."
      );
      return;
    }

    if (missingPosition) {
      setError(
        `Please select a candidate for ${missingPosition}.`
      );
      return;
    }

    const ballotSelections:
      BallotSelection[] =
      positions.map(
        (position) => ({
          position,
          candidateId: String(
            selections[position]
          ),
        })
      );

    submissionAttempted.current =
      true;

    setIsSubmitting(true);

    try {
      /**
       * The browser sends ONLY:
       *
       * - Election ID
       * - Voting-session token
       * - Candidate selections
       *
       * No voter ID or access code.
       *
       * Next.js signs the request.
       *
       * Apps Script identifies the voter
       * from the authenticated session.
       */
      const response = await fetch(
        "/api/election",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            action: "submitBallot",
            electionId:
              config.electionId,
            sessionToken:
              session.token,
            selections:
              ballotSelections,
          }),
        }
      );

      const data =
        (await response.json()) as
          BallotSubmissionResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        switch (data.code) {
          case "BALLOT_SUBMISSION_DISABLED":
            setError(
              "Voting is not enabled yet."
            );
            submissionAttempted.current =
              false;
            return;

          case "ELECTION_NOT_OPEN":
            setError(
              "Voting is not currently open."
            );
            submissionAttempted.current =
              false;
            return;

          case "INVALID_SESSION":
            setError(
              "Your voting session is invalid or has expired. Please verify again."
            );
            return;

          case "ALREADY_VOTED":
            setError(
              "A ballot has already been submitted using this voter credential."
            );
            return;

          case "INCOMPLETE_BALLOT":
          case "INVALID_BALLOT":
          case "INVALID_SELECTION":
          case "DUPLICATE_POSITION":
            setError(
              data.message ||
                "Please review your ballot selections."
            );
            submissionAttempted.current =
              false;
            return;

          case "SUBMISSION_REQUIRES_REVIEW":
            setError(
              "Your ballot submission could not be confirmed. Do not submit again. Contact the Electoral Commission."
            );
            return;

          default:
            setError(
              data.message ||
                "Unable to submit your ballot. Please contact the Electoral Commission before trying again."
            );
            return;
        }
      }

      /**
       * Only a committed ballot with
       * a valid reference is considered
       * successfully submitted.
       */
      if (
        data.status !== "COMMITTED" ||
        typeof data.reference !==
          "string" ||
        !data.reference.startsWith(
          "ballot-"
        )
      ) {
        setError(
          "The server did not confirm that your ballot was committed. Do not submit again. Contact the Electoral Commission."
        );
        return;
      }

      onSubmitted(
        data.reference
      );

    } catch {
      /**
       * Network failures are ambiguous:
       * the server may have committed
       * the ballot before the connection
       * was interrupted.
       *
       * Do not automatically retry.
       */
      setError(
        "The submission result could not be confirmed. Do not submit again until the Electoral Commission verifies your ballot status."
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

  if (
    error &&
    candidates.length === 0
  ) {
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

  // =====================================================
  // BALLOT UI
  // =====================================================

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>
          Official Ballot
        </CardTitle>

        <p className="text-sm text-slate-600">
          Voting as{" "}
          <span className="font-semibold text-slate-900">
            {voter.name}
          </span>
          . Select one candidate for each
          position.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <Clock3 className="h-4 w-4" />
            Session time remaining
          </div>

          <span className="font-mono text-sm font-bold text-green-900">
            {formatRemainingTime(
              remainingMs
            )}
          </span>
        </div>

        {!sessionValid && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Your voting session is
            unavailable or has expired.
            Please verify your access
            code again.
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-10"
        >
          {positions.map(
            (position) => (
              <fieldset
                key={position}
                disabled={
                  !sessionValid ||
                  isSubmitting ||
                  submissionAttempted.current
                }
              >
                <legend className="mb-4 text-xl font-bold text-slate-900">
                  {position}
                </legend>

                <div className="space-y-3">
                  {candidatesByPosition[
                    position
                  ].map(
                    (candidate) => {
                      const isSelected =
                        String(
                          selections[
                            position
                          ]
                        ) ===
                        String(
                          candidate.id
                        );

                      return (
                        <label
                          key={String(
                            candidate.id
                          )}
                          className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                            isSelected
                              ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                              : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={position}
                            value={String(
                              candidate.id
                            )}
                            checked={
                              isSelected
                            }
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
                              src={
                                candidate.image
                              }
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
                                {
                                  candidate.location
                                }
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    }
                  )}
                </div>
              </fieldset>
            )
          )}

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
            className="h-12 w-full bg-green-700 text-base font-semibold hover:bg-green-800"
            disabled={
              !canSubmit
            }
          >
            <LockKeyhole className="mr-2 h-4 w-4" />

            {isSubmitting
              ? "Submitting Ballot..."
              : "Submit Complete Ballot"}
          </Button>

          {!BALLOT_SUBMISSION_ENABLED && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Ballot submission is temporarily disabled
              </p>

              <p className="mt-2 text-xs leading-5 text-amber-800">
                The election system is undergoing final
                security integration. You can review the
                ballot, but votes cannot be submitted yet.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

              <p className="text-xs leading-5 text-slate-600">
                Your ballot is authorized
                using a secure voting
                session. Each eligible
                voter may submit only
                one complete ballot.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}