"use client";

import { useEffect, useState } from "react";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import {
  getElection,
  getResults,
  getCandidates,
  type ElectionCandidate,
  type PositionResult,
  type ResultCandidate,
  type ResultsSummary,
} from "@/services/electionService";

interface ResultsDashboardProps {
  mode?: "public" | "admin";
}

// =====================================================
// OFFICIAL DECLARATION CONFIGURATION
// =====================================================

/**
 * This reflects the Electoral Commission's confirmed
 * declaration of the six elected positions.
 *
 * IMPORTANT:
 * This is a frontend presentation configuration.
 * It does not modify the backend election records.
 *
 * Do not change this to FINAL automatically.
 */
const DECLARATION_STATUS = "DECLARED" as const;

const ELECTION_DATE = "22 November 2026";

const PETITION_DEADLINE =
  "25 November 2026 at 7:30 PM (Moscow time)";

const PETITION_START =
  "22 November 2026 at 7:30 PM (Moscow time)";

const DECLARED_POSITIONS = [
  "President",
  "General Secretary",
  "Financial Secretary",
  "Organizing Secretary",
  "Public Relations Officer",
  "Women's Commissioner",
] as const;

/**
 * Names are used to identify the Electoral Commission's
 * declared candidates within the existing results.
 *
 * Votes and percentages are NEVER hardcoded.
 * They always come from getResults().
 */
const DECLARED_WINNERS: Record<string, string> = {
  President: "Wepari Ebenezer Yaw",
  "General Secretary": "Fosu Enoch Yaw",
  "Financial Secretary": "Japheth Bondzie Appah",
  "Organizing Secretary": "Kafui Kwaku Feyi",
  "Public Relations Officer": "Amoah Winfred Kofi",
  "Women's Commissioner": "Hasia Mwinebang Seidu",
};

const PRESIDENTIAL_RUNNING_MATE = "Jibrill";

// =====================================================
// HELPERS
// =====================================================

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function formatPercentage(value: number) {
  return Number(value || 0).toFixed(2);
}

function findDeclaredWinner(
  result: PositionResult
): ResultCandidate | null {
  const declaredName =
    DECLARED_WINNERS[result.position];

  if (!declaredName) {
    return null;
  }

  return (
    result.candidates.find(
      (candidate) =>
        normalize(candidate.name) ===
        normalize(declaredName)
    ) || null
  );
}

function findCandidateProfile(
  candidate: ResultCandidate,
  profiles: ElectionCandidate[]
) {
  return profiles.find(
    (profile) =>
      String(profile.id) === String(candidate.id)
  );
}

function getDecisionStyles(
  status: PositionResult["status"]
) {
  switch (status) {
    case "WINNER_DECLARED":
      return "border-green-200 bg-green-50 text-green-800";

    case "RUNOFF_REQUIRED":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "TIE":
      return "border-orange-200 bg-orange-50 text-orange-800";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getDecisionTitle(
  status: PositionResult["status"]
) {
  switch (status) {
    case "WINNER_DECLARED":
      return "Winner Declared";

    case "RUNOFF_REQUIRED":
      return "Runoff Required";

    case "TIE":
      return "Tie";

    case "NO_VOTES":
      return "No Votes Cast";

    case "NO_CANDIDATES":
      return "No Candidates";

    default:
      return "Result";
  }
}

// =====================================================
// COMPONENT
// =====================================================

export default function ResultsDashboard({
  mode = "public",
}: ResultsDashboardProps) {
  const [summary, setSummary] =
    useState<ResultsSummary | null>(null);

  const [results, setResults] =
    useState<PositionResult[]>([]);

  const [candidateProfiles, setCandidateProfiles] =
    useState<ElectionCandidate[]>([]);

  const [resultsVisible, setResultsVisible] =
    useState(false);

  const [electionStatus, setElectionStatus] =
    useState("");

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      try {
        setError("");

        const electionResponse =
          await getElection();

        if (!isMounted) return;

        const election =
          electionResponse.election;

        const canViewResults =
          mode === "admin" ||
          Boolean(election?.resultsVisible);

        setResultsVisible(canViewResults);

        setElectionStatus(
          election?.status || ""
        );

        if (!canViewResults) return;

        const resultsResponse =
          await getResults();

        if (!isMounted) return;

        setSummary(resultsResponse.summary);

        setResults(
          resultsResponse.results || []
        );

        /**
         * Candidate profiles are used for photographs
         * and running-mate information only.
         *
         * Failure to load profiles must not prevent
         * election results from displaying.
         */
        try {
          const candidatesResponse =
            await getCandidates();

          if (isMounted) {
            setCandidateProfiles(
              candidatesResponse.candidates || []
            );
          }
        } catch (profileError) {
          console.warn(
            "Candidate profiles unavailable:",
            profileError
          );
        }
      } catch (error) {
        if (!isMounted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load election results."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      isMounted = false;
    };
  }, [mode]);

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <Section className="bg-slate-50">
        <Container>
          <div className="py-24 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />

            <p className="mt-6 font-medium text-slate-600">
              Loading election results...
            </p>
          </div>
        </Container>
      </Section>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <Section className="bg-slate-50">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-800">
              Unable to Load Results
            </h1>

            <p className="mt-3 text-red-700">
              {error}
            </p>
          </div>
        </Container>
      </Section>
    );
  }

  // =====================================================
  // RESULTS NOT PUBLISHED
  // =====================================================

  if (!resultsVisible) {
    return (
      <Section className="bg-slate-50">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              🔒
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              Results Not Yet Published
            </h1>

            <p className="mt-4 text-slate-600">
              Election results will become available
              after publication by the Electoral
              Commission.
            </p>

            {electionStatus && (
              <p className="mt-5 text-sm text-slate-500">
                Election status: {electionStatus}
              </p>
            )}
          </div>
        </Container>
      </Section>
    );
  }

  // =====================================================
  // DECLARED WINNERS
  // =====================================================

  const declaredWinners = DECLARED_POSITIONS.map(
    (position) => {
      const result = results.find(
        (item) =>
          normalize(item.position) ===
          normalize(position)
      );

      if (!result) return null;

      const winner = findDeclaredWinner(result);

      if (!winner) return null;

      const profile = findCandidateProfile(
        winner,
        candidateProfiles
      );

      return {
        position,
        winner,
        profile,
        result,
      };
    }
  ).filter(
    (
      item
    ): item is NonNullable<typeof item> =>
      item !== null
  );

  const allDeclarationsMatched =
    declaredWinners.length ===
    DECLARED_POSITIONS.length;

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <Section className="bg-slate-50">
      <Container>
        {/* ==========================================
            OFFICIAL DECLARATION HERO
        ========================================== */}

        <div className="relative mb-12 overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white shadow-xl sm:px-10 lg:px-14">
          <div className="absolute inset-x-0 top-0 flex h-1.5">
            <div className="w-1/3 bg-red-600" />
            <div className="w-1/3 bg-yellow-400" />
            <div className="w-1/3 bg-green-600" />
          </div>

          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-300">
              <ShieldCheck size={16} />
              Electoral Commission Declaration
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              ACGC General Elections 2026
            </p>

            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Declared Election Results
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
              The Electoral Commission has declared
              the candidates elected to the six
              contested executive positions.
              The declaration remains subject to
              the prescribed 72-hour petition period.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
                <CheckCircle2 size={17} />
                Winners Declared
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
                <Clock3 size={17} />
                Subject to Petitions
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <CalendarDays size={17} />
              Election held on {ELECTION_DATE}
            </div>
          </div>
        </div>

        {/* ==========================================
            PETITION NOTICE
        ========================================== */}

        <div className="mb-14 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock3 size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-amber-950">
                72-Hour Petition Period
              </h2>

              <p className="mt-3 leading-relaxed text-amber-900">
                The petition period commenced upon
                publication of the provisional
                election results on{" "}
                <strong>{PETITION_START}</strong>.
              </p>

              <p className="mt-3 text-amber-900">
                Petition submission deadline:
              </p>

              <p className="mt-1 text-lg font-black text-amber-950 sm:text-xl">
                {PETITION_DEADLINE}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-amber-800">
                Final certification will follow
                the conclusion of the petition
                process and the resolution of
                any admissible petitions.
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            ELECTION STATISTICS
        ========================================== */}

        {summary && (
          <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Registered Voters",
                value: summary.registeredVoters,
                icon: Users,
              },
              {
                label: "Ballots Cast",
                value: summary.votesCast,
                icon: Vote,
              },
              {
                label: "Voter Turnout",
                value: `${summary.turnoutPercentage}%`,
                icon: CheckCircle2,
              },
              {
                label: "Vote Records",
                value: summary.totalVoteRecords,
                icon: FileText,
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">
                      {stat.label}
                    </p>

                    <Icon
                      size={20}
                      className="text-green-700"
                    />
                  </div>

                  <p className="mt-4 text-3xl font-black text-slate-900">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ==========================================
            DECLARED EXECUTIVES
        ========================================== */}

        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Award size={28} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-700">
            Electoral Commission Declaration
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Your Declared Executives
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Meet the candidates declared elected
            following the ACGC General Elections
            held on 22 November 2026.
          </p>
        </div>

        {!allDeclarationsMatched && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Some declared candidate records could
            not be matched to the published results.
            Please verify the candidate names and
            positions before relying on this display.
          </div>
        )}

        <div className="mb-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {declaredWinners.map(
            ({ position, winner, profile }) => {
              const isPresident =
                normalize(position) ===
                normalize("President");

              const runningMate =
                profile?.runningMate?.trim() ||
                PRESIDENTIAL_RUNNING_MATE;

              const image =
                profile?.image ||
                winner.image;

              return (
                <div
                  key={position}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-green-600" />

                  <div className="p-7">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                        {position}
                      </span>

                      <Award
                        size={23}
                        className="text-amber-500"
                      />
                    </div>

                    <div className="mb-5 flex justify-center">
                      {image ? (
                        <img
                          src={image}
                          alt={winner.name}
                          className="h-28 w-28 rounded-full border-4 border-green-100 object-cover shadow-md"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-4xl font-black text-green-800">
                          {winner.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="text-xl font-black text-slate-900">
                        {winner.name}
                      </h3>

                      {winner.location && (
                        <p className="mt-1 text-sm text-slate-500">
                          {winner.location}
                        </p>
                      )}

                      {isPresident && (
                        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Presidential Running Mate
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {runningMate}
                          </p>
                        </div>
                      )}

                      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                        <CheckCircle2 size={16} />
                        Declared Elected
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-2 divide-x divide-slate-200 rounded-2xl bg-slate-50 py-4 text-center">
                      <div>
                        <p className="text-2xl font-black text-slate-900">
                          {winner.votes}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Votes
                        </p>
                      </div>

                      <div>
                        <p className="text-2xl font-black text-green-700">
                          {formatPercentage(
                            winner.percentage
                          )}
                          %
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Vote Share
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* ==========================================
            DETAILED RESULTS
        ========================================== */}

        <div className="mb-10 border-t border-slate-200 pt-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-700">
            Election Transparency
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-900">
            Detailed Election Results
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Complete vote breakdown by position,
            including the original result decisions
            returned by the election system.
          </p>

          {mode === "admin" && (
            <p className="mt-3 text-sm font-semibold text-amber-700">
              Administrative preview
            </p>
          )}
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-600">
            No election results are currently available.
          </div>
        ) : (
          <div className="space-y-8">
            {results.map((result) => (
              <div
                key={result.position}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">
                        {result.position}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {result.totalValidVotes} valid votes
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Winning Threshold
                      </p>

                      <p className="mt-1 text-2xl font-black text-slate-900">
                        {result.winningThreshold}
                      </p>

                      <p className="text-xs text-slate-500">
                        {result.majorityRule}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-6 rounded-xl border p-4 ${getDecisionStyles(
                      result.status
                    )}`}
                  >
                    <p className="font-bold">
                      {getDecisionTitle(
                        result.status
                      )}
                    </p>

                    <p className="mt-1 text-sm">
                      {result.message}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-6 sm:p-8">
                  {result.candidates.map(
                    (candidate) => {
                      const declaredWinner =
                        findDeclaredWinner(result);

                      const isDeclared =
                        declaredWinner &&
                        String(declaredWinner.id) ===
                          String(candidate.id);

                      return (
                        <div
                          key={String(candidate.id)}
                          className={`rounded-xl border p-5 ${
                            isDeclared
                              ? "border-green-300 bg-green-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              {candidate.image && (
                                <img
                                  src={candidate.image}
                                  alt=""
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              )}

                              <div>
                                <p className="font-bold text-slate-900">
                                  {candidate.name}
                                </p>

                                {candidate.location && (
                                  <p className="text-sm text-slate-500">
                                    {candidate.location}
                                  </p>
                                )}

                                {isDeclared && (
                                  <span className="mt-2 inline-flex rounded-full bg-green-700 px-2.5 py-1 text-xs font-bold text-white">
                                    Declared Elected
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-xl font-black text-slate-900">
                                {candidate.votes}
                              </p>

                              <p className="text-sm text-slate-500">
                                {formatPercentage(
                                  candidate.percentage
                                )}
                                %
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-green-700"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    Number(
                                      candidate.percentage
                                    ) || 0,
                                    100
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==========================================
            DECLARATION FOOTNOTE
        ========================================== */}

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck
              size={22}
              className="text-green-700"
            />

            <h3 className="text-base font-bold text-slate-900">
              Electoral Commission Notice
            </h3>
          </div>

          <p className="mt-4">
            The candidates displayed above have
            been declared elected by the ACGC
            Electoral Commission. This declaration
            remains subject to the prescribed
            72-hour petition period.
          </p>

          <p className="mt-3">
            The petition deadline is{" "}
            <strong>{PETITION_DEADLINE}</strong>.
            Final certification remains subject
            to the Commission's determination
            following the petition process.
          </p>

          <p className="mt-3">
            Vote counts, percentages, and turnout
            statistics are retrieved from the
            election results system.
          </p>

          <p className="mt-4 font-semibold text-slate-800">
            Declaration status: {DECLARATION_STATUS}
          </p>
        </div>
      </Container>
    </Section>
  );
}