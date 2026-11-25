"use client";

import { useEffect, useState } from "react";

import {
  Award,
  CalendarDays,
  CheckCircle2,
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

// =====================================================
// TYPES
// =====================================================

interface ResultsDashboardProps {
  mode?: "public" | "admin";
}

interface CertifiedExecutive {
  position: string;
  image: string;
  winner: ResultCandidate;
  profile?: ElectionCandidate;
}

// =====================================================
// OFFICIAL CERTIFICATION CONFIGURATION
// =====================================================

/**
 * ACGC GENERAL ELECTIONS 2026
 *
 * Election Date:
 * 22 November 2026
 *
 * Petition Period:
 * 22 November 2026, 7:30 PM Moscow Time
 * through
 * 25 November 2026, 7:30 PM Moscow Time
 *
 * No petitions were received.
 *
 * The Electoral Commission has approved
 * final certification of the election results.
 *
 * IMPORTANT:
 * This configuration changes presentation only.
 * It does not modify election records, ballots,
 * vote counts, or backend data.
 */

const CERTIFICATION_STATUS = "CERTIFIED" as const;

const ELECTION_DATE = "22 November 2026";

const CERTIFICATION_DATE = "25 November 2026";

const PETITION_START =
  "22 November 2026 at 7:30 PM (Moscow time)";

const PETITION_DEADLINE =
  "25 November 2026 at 7:30 PM (Moscow time)";

const PRESIDENTIAL_RUNNING_MATE = "Nkum Jibril Kojo";

// =====================================================
// OFFICIALLY CERTIFIED EXECUTIVES
// =====================================================

/**
 * These are the six candidates whose election
 * has been certified by the Electoral Commission.
 *
 * Their vote counts and percentages are always
 * retrieved from the election results API.
 *
 * Images are stored in public/candidates/.
 */

const CERTIFIED_EXECUTIVES = [
  {
    position: "President",
    name: "Wepari Ebenezer Yaw",
    image: "/candidates/wepari-jibril.png",
  },
  {
    position: "General Secretary",
    name: "Fosu Enoch Yaw",
    image: "/candidates/enoch-fosu.jpg",
  },
  {
    position: "Financial Secretary",
    name: "Japheth Bondzie Appah",
    image: "/candidates/japhet-appah.png",
  },
  {
    position: "Organizing Secretary",
    name: "Kafui Kwaku Feyi",
    image: "/candidates/kafui-feyi.jpg",
  },
  {
    position: "Public Relations Officer",
    name: "Amoah Winfred Kofi",
    image: "/candidates/winfred-amoah.jpeg",
  },
  {
    position: "Women's Commissioner",
    name: "Hasia Mwinebang Seidu",
    image: "/candidates/hasia-seidu.jpeg",
  },
] as const;

// =====================================================
// NORMALIZATION HELPERS
// =====================================================

/**
 * Normalize names and position labels.
 *
 * Handles:
 * - Uppercase/lowercase
 * - Extra spaces
 * - Hyphens
 * - Curly apostrophes
 * - Straight apostrophes
 * - Punctuation
 */

function normalize(value: string): string {
  return String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Handle different position labels.
 *
 * Examples:
 *
 * Public Relations Officer (PRO)
 * Public Relations Officer
 * PRO
 *
 * Women's Commissioner
 * Women’s Commissioner
 * Womens Commissioner
 */

function normalizePosition(value: string): string {
  const normalized = normalize(value);

  if (
    normalized === "pro" ||
    normalized === "publicrelationsofficer" ||
    normalized === "publicrelationsofficerpro"
  ) {
    return "publicrelationsofficer";
  }

  if (
    normalized === "womenscommissioner" ||
    normalized === "womancommissioner"
  ) {
    return "womenscommissioner";
  }

  return normalized;
}

function positionsMatch(
  first: string,
  second: string
): boolean {
  return (
    normalizePosition(first) ===
    normalizePosition(second)
  );
}

function namesMatch(
  first: string,
  second: string
): boolean {
  return normalize(first) === normalize(second);
}

function formatPercentage(value: number): string {
  return Number(value || 0).toFixed(2);
}

// =====================================================
// CERTIFIED WINNER HELPERS
// =====================================================

function findCertification(position: string) {
  return CERTIFIED_EXECUTIVES.find((executive) =>
    positionsMatch(executive.position, position)
  );
}

/**
 * Match the officially certified candidate
 * against the actual backend election results.
 *
 * No vote totals or percentages are invented.
 */

function findCertifiedWinner(
  result: PositionResult
): ResultCandidate | null {
  const certification = findCertification(result.position);

  if (!certification) {
    return null;
  }

  return (
    result.candidates.find((candidate) =>
      namesMatch(candidate.name, certification.name)
    ) || null
  );
}

/**
 * Match candidate profiles using ID first,
 * followed by name and position.
 */

function findCandidateProfile(
  candidate: ResultCandidate,
  position: string,
  profiles: ElectionCandidate[]
): ElectionCandidate | undefined {
  const byId = profiles.find(
    (profile) =>
      String(profile.id) === String(candidate.id)
  );

  if (byId) {
    return byId;
  }

  return profiles.find(
    (profile) =>
      namesMatch(profile.name, candidate.name) &&
      positionsMatch(profile.position, position)
  );
}

/**
 * Resolve a candidate photograph.
 *
 * Official local images take priority.
 * Backend images are used as fallbacks.
 */

function getCandidateImage(
  candidate: ResultCandidate,
  position: string,
  profiles: ElectionCandidate[]
): string {
  const certification = findCertification(position);

  const isCertifiedCandidate =
    certification &&
    namesMatch(candidate.name, certification.name);

  if (isCertifiedCandidate && certification) {
    return certification.image;
  }

  const profile = findCandidateProfile(
    candidate,
    position,
    profiles
  );

  return profile?.image || candidate.image || "";
}

// =====================================================
// BACKEND DECISION HELPERS
// =====================================================

/**
 * Original automated election decisions
 * remain available for transparency.
 *
 * These historical messages may still
 * refer to provisional results.
 *
 * They do not override the subsequent
 * Electoral Commission certification.
 */

function getDecisionStyles(
  status: PositionResult["status"]
): string {
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
): string {
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
// MAIN COMPONENT
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

  // =====================================================
  // LOAD ELECTION DATA
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      try {
        setError("");

        const electionResponse = await getElection();

        if (!isMounted) return;

        const election = electionResponse.election;

        const canViewResults =
          mode === "admin" ||
          Boolean(election?.resultsVisible);

        setResultsVisible(canViewResults);

        setElectionStatus(election?.status || "");

        if (!canViewResults) {
          return;
        }

        const resultsResponse = await getResults();

        if (!isMounted) return;

        setSummary(resultsResponse.summary);

        setResults(resultsResponse.results || []);

        /**
         * Candidate profiles are optional.
         *
         * Their failure must not prevent
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
  // LOADING STATE
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
  // ERROR STATE
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
                Election status:{" "}
                <span className="font-semibold">
                  {electionStatus}
                </span>
              </p>
            )}
          </div>
        </Container>
      </Section>
    );
  }

  // =====================================================
  // MATCH CERTIFIED EXECUTIVES
  // =====================================================

  const certifiedWinners: CertifiedExecutive[] =
    CERTIFIED_EXECUTIVES.flatMap((certification) => {
      const result = results.find((item) =>
        positionsMatch(
          item.position,
          certification.position
        )
      );

      if (!result) {
        return [];
      }

      const winner = result.candidates.find(
        (candidate) =>
          namesMatch(candidate.name, certification.name)
      );

      if (!winner) {
        return [];
      }

      const profile = findCandidateProfile(
        winner,
        result.position,
        candidateProfiles
      );

      return [
        {
          position: certification.position,
          image: certification.image,
          winner,
          profile,
        },
      ];
    });

  const missingCertifications =
    CERTIFIED_EXECUTIVES.filter(
      (certification) =>
        !certifiedWinners.some((executive) =>
          positionsMatch(
            executive.position,
            certification.position
          )
        )
    );

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <Section className="bg-slate-50">
      <Container>
        {/* ==========================================
            OFFICIAL CERTIFICATION HERO
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
              Electoral Commission Certification
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              ACGC General Elections 2026
            </p>

            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Official Certified Election Results
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
              The ACGC Electoral Commission has
              formally certified the results of
              the General Elections held on
              22 November 2026.
              Following the conclusion of the
              prescribed 72-hour petition period,
              during which no petitions were received,
              the Commission approved the final
              certification of all six executive
              positions.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
                <CheckCircle2 size={17} />
                Results Officially Certified
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-green-400/40 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-200">
                <ShieldCheck size={17} />
                Final Results
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <CalendarDays size={17} />
              Election held on {ELECTION_DATE}
            </div>

            <p className="mt-3 text-sm text-slate-400">
              Certified by the Electoral Commission
              on {CERTIFICATION_DATE}.
            </p>
          </div>
        </div>

        {/* ==========================================
            PETITION PERIOD CONCLUDED
        ========================================== */}

        <div className="mb-14 rounded-2xl border border-green-200 bg-green-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <CheckCircle2 size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-950">
                Petition Period Successfully Concluded
              </h2>

              <p className="mt-3 leading-relaxed text-green-900">
                The prescribed 72-hour petition period
                commenced on{" "}
                <strong>{PETITION_START}</strong>
                {" "}and concluded on{" "}
                <strong>{PETITION_DEADLINE}</strong>.
              </p>

              <p className="mt-4 font-bold text-green-900">
                No petitions were received within
                the stipulated period.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-green-800">
                Following the conclusion of the petition
                process, the Electoral Commission
                formally approved the final certification
                of the published election results.
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
            OFFICIALLY ELECTED EXECUTIVES
        ========================================== */}

        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Award size={28} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-700">
            Electoral Commission Certification
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Your Officially Elected Executives
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Meet the six executives officially
            elected and certified following the
            ACGC General Elections held on
            22 November 2026.
          </p>
        </div>

        {/* ==========================================
            CERTIFICATION MATCHING WARNING
        ========================================== */}

        {missingCertifications.length > 0 && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-bold">
              Some certified candidates could not
              be matched to the published results.
            </p>

            <p className="mt-2">
              Please verify the following
              candidate records:
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              {missingCertifications.map((certification) => (
                <li key={certification.position}>
                  {certification.position}
                  {" — "}
                  {certification.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ==========================================
            EXECUTIVE CARDS
        ========================================== */}

        <div className="mb-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {certifiedWinners.map(
            ({ position, winner, profile, image }) => {
              const isPresident = positionsMatch(
                position,
                "President"
              );

              const runningMate =
                profile?.runningMate?.trim() ||
                PRESIDENTIAL_RUNNING_MATE;

              const candidateImage =
                image || profile?.image || winner.image;

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

                    {/* Official candidate photograph */}

                    <div className="mb-5 flex justify-center">
                      {candidateImage ? (
                        <img
                          src={candidateImage}
                          alt={
                            isPresident
                              ? `${winner.name} and ${runningMate}`
                              : winner.name
                          }
                          className={`rounded-full border-4 border-green-100 object-cover shadow-md ${
                            isPresident
                              ? "h-36 w-36"
                              : "h-32 w-32"
                          }`}
                        />
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-100 text-4xl font-black text-green-800">
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

                      {/* Presidential running mate */}

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

                      {/* Certification badge */}

                      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                        <CheckCircle2 size={16} />
                        Officially Elected
                      </div>
                    </div>

                    {/* Vote statistics */}

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
            DETAILED ELECTION RESULTS
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
            recorded by the election system.
            These results have subsequently received
            final certification from the Electoral
            Commission.
          </p>

          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <strong>Certification Notice:</strong>{" "}
            The original automated result messages
            below are preserved for transparency.
            Where they refer to provisional results
            or pending certification, those statements
            reflect the earlier election stage and
            have been superseded by the Electoral
            Commission's formal certification.
          </div>

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
            {results.map((result) => {
              const certifiedWinner =
                findCertifiedWinner(result);

              return (
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

                    {/* Original backend decision */}

                    <div
                      className={`mt-6 rounded-xl border p-4 ${getDecisionStyles(
                        result.status
                      )}`}
                    >
                      <p className="font-bold">
                        {getDecisionTitle(result.status)}
                      </p>

                      <p className="mt-1 text-sm">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  {/* Candidate vote breakdown */}

                  <div className="space-y-4 p-6 sm:p-8">
                    {result.candidates.length === 0 ? (
                      <p className="text-slate-500">
                        No candidates registered
                        for this position.
                      </p>
                    ) : (
                      result.candidates.map((candidate) => {
                        const isCertified =
                          Boolean(
                            certifiedWinner &&
                              String(certifiedWinner.id) ===
                                String(candidate.id)
                          );

                        const candidateImage =
                          getCandidateImage(
                            candidate,
                            result.position,
                            candidateProfiles
                          );

                        return (
                          <div
                            key={String(candidate.id)}
                            className={`rounded-xl border p-5 ${
                              isCertified
                                ? "border-green-300 bg-green-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                {candidateImage ? (
                                  <img
                                    src={candidateImage}
                                    alt={candidate.name}
                                    className="h-12 w-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
                                    {candidate.name.charAt(0)}
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900">
                                    {candidate.name}
                                  </p>

                                  {candidate.location && (
                                    <p className="text-sm text-slate-500">
                                      {candidate.location}
                                    </p>
                                  )}

                                  {isCertified && (
                                    <span className="mt-2 inline-flex rounded-full bg-green-700 px-2.5 py-1 text-xs font-bold text-white">
                                      Officially Elected
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

                            {/* Vote percentage bar */}

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
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==========================================
            OFFICIAL ELECTORAL COMMISSION NOTICE
        ========================================== */}

        <div className="mt-12 rounded-2xl border border-green-200 bg-white p-6 text-sm leading-relaxed text-slate-600 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck
              size={22}
              className="text-green-700"
            />

            <h3 className="text-base font-bold text-slate-900">
              Official Electoral Commission Certification
            </h3>
          </div>

          <p className="mt-4">
            The ACGC Electoral Commission hereby
            confirms the final certification of
            the results of the General Elections
            held on{" "}
            <strong>{ELECTION_DATE}</strong>.
          </p>

          <p className="mt-3">
            The prescribed petition period concluded
            on{" "}
            <strong>{PETITION_DEADLINE}</strong>,
            with no petitions received.
          </p>

          <p className="mt-3">
            Following formal approval by the Commission,
            the six declared election outcomes are
            confirmed as final and certified.
          </p>

          <p className="mt-3">
            All vote counts, percentages, and turnout
            statistics remain unchanged and are
            retrieved directly from the election
            results system.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 font-bold text-white">
            <CheckCircle2 size={17} />
            Certification Status: {CERTIFICATION_STATUS}
          </div>
        </div>
      </Container>
    </Section>
  );
}