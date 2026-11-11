import { config } from "@/lib/config";

const ELECTION_ID = config.electionId;

// =====================================================
// BASE TYPES
// =====================================================

interface ApiResponse {
  success: boolean;
  message?: string;
  code?: string;
}

export type Id = string | number;

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

export interface AdminUser {
  id: string;
  username: string;
  role: string;
  active: boolean;
}

interface LoginAdminResponse extends ApiResponse {
  token?: string;
  expiresAt?: string;
  admin?: AdminUser;
}

interface VerifyAdminSessionResponse extends ApiResponse {
  expiresAt?: string;
  admin?: AdminUser;
}

// =====================================================
// VOTERS
// =====================================================

export interface VoterSearchResult {
  id: Id;
  name: string;
  location?: string;
}

export interface VerifiedVoter {
  id: Id;
  electionId: string;
  name: string;
  gender?: string;
  location?: string;
  hasVoted: boolean;
  votedAt?: string;
}

export interface AdminVoter {
  id: Id;
  electionId: string;
  name: string;

  // Retained for compatibility with existing
  // spreadsheet records.
  email?: string;
  phone?: string;

  gender: string;
  location: string;
  hasVoted: boolean;
  votedAt: string;
}

export interface VoterInput {
  name: string;
  gender: "Male" | "Female";
  location: string;
}

export type VoterImportRecord = VoterInput;

export interface VoterImportError {
  row: number;
  message: string;
}

// =====================================================
// VOTER ACCESS CODES
// =====================================================

export interface VoterAccessCodeStatus {
  voterId: string;
  status: string;
  issuedAt: string;
}

export interface GetVoterAccessCodeStatusesResponse
  extends ApiResponse {
  electionId: string;
  codes: VoterAccessCodeStatus[];
}

/**
 * Response returned after generating a new
 * voter access code.
 *
 * The plaintext access code is returned once
 * and must not be persisted in browser storage.
 */
export interface GenerateVoterAccessCodeResponse
  extends ApiResponse {
  accessCode: string;
  voterId: string;
}

export interface BulkGeneratedAccessCode {
  voterId: string;
  voterName: string;
  accessCode: string;
}

export interface GenerateBulkVoterAccessCodesResponse
  extends ApiResponse {
  electionId: string;
  totalVoters: number;
  generated: number;
  activeCodes: number;
  remaining: number;
  completed: boolean;
  codes?: {
    voterId: string;
    accessCode: string;
  }[];
}

// =====================================================
// CANDIDATES
// =====================================================

export interface ElectionCandidate {
  id: Id;
  electionId?: string;
  name: string;
  position: string;
  location: string;
  image?: string;
  runningMate?: string;
}

export interface AdminCandidate
  extends ElectionCandidate {
  electionId: string;
  image: string;
}

// =====================================================
// VOTING
// =====================================================

export interface BallotSelection {
  position: string;
  candidateId: Id;
}

// =====================================================
// RESULTS
// =====================================================

export interface ResultCandidate {
  id: Id;
  name: string;
  location?: string;
  image?: string;
  votes: number;
  percentage: number;
}

export type PositionDecisionStatus =
  | "WINNER_DECLARED"
  | "RUNOFF_REQUIRED"
  | "TIE"
  | "NO_VOTES"
  | "NO_CANDIDATES";

export interface PositionResult {
  position: string;
  status: PositionDecisionStatus;
  totalValidVotes: number;
  winningThreshold: number;
  majorityRule: string;
  winner: ResultCandidate | null;
  runoffCandidates: ResultCandidate[];
  message: string;
  candidates: ResultCandidate[];
}

export interface ResultsSummary {
  registeredVoters: number;
  votesCast: number;
  turnoutPercentage: number;
  totalVoteRecords: number;
}

// =====================================================
// ELECTION
// =====================================================

export type ElectionStatus =
  | "Draft"
  | "Open"
  | "Closed"
  | "Results Published";

export interface Election {
  id: string;
  title: string;
  status: ElectionStatus;
  resultsVisible: boolean;
  majorityRule: string;
  verificationMethod: string;
}

// =====================================================
// ELECTION READINESS
// =====================================================

export interface ElectionReadiness {
  ready: boolean;
  checksPassed: boolean;
  openingEnabled: boolean;
  registeredVoters: number;
  registeredCandidates: number;
  accessCodesIssued: number;
  accessCodesRequired: number;
  issues: string[];
}

// =====================================================
// ANALYTICS
// =====================================================

export interface TurnoutSummary {
  registeredVoters: number;
  votesCast: number;
  remainingVoters: number;
  turnoutPercentage: number;
}

export interface GenderAnalytics {
  gender: string;
  registered: number;
  voted: number;
  remaining: number;
  turnoutPercentage: number;
}

export interface LocationAnalytics {
  location: string;
  registered: number;
  voted: number;
  remaining: number;
  turnoutPercentage: number;
}

export interface VotingActivity {
  hour: string;
  votes: number;
}

export interface CandidateLocationCount {
  location: string;
  votes: number;
}

export interface CandidateBreakdownItem {
  id: Id;
  name: string;
  image?: string;
  totalVotes: number;
  locations: CandidateLocationCount[];
}

export interface PositionCandidateBreakdown {
  position: string;
  candidates: CandidateBreakdownItem[];
}

export interface ElectionAnalytics {
  summary: TurnoutSummary;
  gender: GenderAnalytics[];
  locations: LocationAnalytics[];
  votingActivity: VotingActivity[];
  resultsVisible: boolean;
  candidateBreakdown?: PositionCandidateBreakdown[];
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

interface SearchVotersResponse
  extends ApiResponse {
  voters: VoterSearchResult[];
}

interface VerifyVoterResponse
  extends ApiResponse {
  voter?: VerifiedVoter;
}

interface GetVotersResponse
  extends ApiResponse {
  voters: AdminVoter[];
}

interface AddVoterResponse
  extends ApiResponse {
  voter?: AdminVoter;
}

interface UpdateVoterResponse
  extends ApiResponse {
  voter?: AdminVoter;
}

interface ImportVotersResponse
  extends ApiResponse {
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: VoterImportError[];
  voters: AdminVoter[];
}

interface GetCandidatesResponse
  extends ApiResponse {
  candidates: ElectionCandidate[];
}

interface GetAdminCandidatesResponse
  extends ApiResponse {
  candidates: AdminCandidate[];
}

interface AddCandidateResponse
  extends ApiResponse {
  candidate?: AdminCandidate;
}

interface UpdateCandidateResponse
  extends ApiResponse {
  candidate?: AdminCandidate;
}

interface DeleteCandidateResponse
  extends ApiResponse {
  candidateId?: Id;
}

interface SubmitBallotResponse
  extends ApiResponse {
  reference?: string;
}

interface GetResultsResponse
  extends ApiResponse {
  summary: ResultsSummary;
  results: PositionResult[];
}

interface ResetElectionResponse
  extends ApiResponse {
  deletedVoteCount: number;
  resetVoterCount: number;
}

interface GetElectionResponse
  extends ApiResponse {
  election?: Election;
}

interface GetElectionsResponse
  extends ApiResponse {
  elections: Election[];
}

interface UpdateElectionStatusResponse
  extends ApiResponse {
  election?: Election;
}

interface GetElectionReadinessResponse
  extends ApiResponse {
  electionId: string;
  readiness: ElectionReadiness;
}

interface GetAnalyticsResponse
  extends ApiResponse {
  electionId: string;
  analytics: ElectionAnalytics;
}

interface GetPollingDashboardResponse
  extends ApiResponse {
  electionId: string;
  dashboard: {
    summary: TurnoutSummary;
    gender: GenderAnalytics[];
    locations: LocationAnalytics[];
    votingActivity: VotingActivity[];
  };
}

// =====================================================
// ADMIN TOKEN
// =====================================================

function getAdminToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.sessionStorage.getItem(
      "gcr-admin-token"
    ) || ""
  );
}

// =====================================================
// API CLIENT
// =====================================================

async function callElectionApi<
  T extends ApiResponse
>(
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    "/api/election",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        adminToken:
          body.adminToken ??
          getAdminToken(),
      }),
      cache: "no-store",
    }
  );

  let data: T;

  try {
    data = (await response.json()) as T;
  } catch {
    throw new Error(
      "The election server returned an invalid response."
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Election server request failed."
    );
  }

  return data;
}

// =====================================================
// ADMIN AUTHENTICATION FUNCTIONS
// =====================================================

export async function loginAdmin(
  username: string,
  password: string
): Promise<LoginAdminResponse> {
  return callElectionApi<LoginAdminResponse>({
    action: "loginAdmin",
    username,
    password,
  });
}

export async function verifyAdminSession(
  adminToken: string
): Promise<VerifyAdminSessionResponse> {
  return callElectionApi<VerifyAdminSessionResponse>({
    action: "verifyAdminSession",
    adminToken,
  });
}

export async function logoutAdmin(
  adminToken: string
): Promise<ApiResponse> {
  return callElectionApi<ApiResponse>({
    action: "logoutAdmin",
    adminToken,
  });
}

// =====================================================
// VOTER FUNCTIONS
// =====================================================

/**
 * Legacy endpoints retained for compatibility.
 * They remain disabled in Apps Script.
 */

export async function searchVoters(
  query: string
): Promise<SearchVotersResponse> {
  return callElectionApi<SearchVotersResponse>({
    action: "searchVoters",
    electionId: ELECTION_ID,
    query,
  });
}

export async function verifyVoter(
  voterId: Id,
  contact: string
): Promise<VerifyVoterResponse> {
  return callElectionApi<VerifyVoterResponse>({
    action: "verifyVoter",
    electionId: ELECTION_ID,
    voterId,
    contact,
  });
}

export async function getVoters(): Promise<GetVotersResponse> {
  return callElectionApi<GetVotersResponse>({
    action: "getVoters",
    electionId: ELECTION_ID,
  });
}

export async function addVoter(
  voter: VoterInput
): Promise<AddVoterResponse> {
  return callElectionApi<AddVoterResponse>({
    action: "addVoter",
    electionId: ELECTION_ID,
    ...voter,
  });
}

export async function updateVoter(
  voterId: Id,
  voter: VoterInput
): Promise<UpdateVoterResponse> {
  return callElectionApi<UpdateVoterResponse>({
    action: "updateVoter",
    electionId: ELECTION_ID,
    voterId,
    ...voter,
  });
}

export async function importVoters(
  voters: VoterImportRecord[]
): Promise<ImportVotersResponse> {
  return callElectionApi<ImportVotersResponse>({
    action: "importVoters",
    electionId: ELECTION_ID,
    voters,
  });
}

// =====================================================
// ACCESS CODE FUNCTIONS
// =====================================================

/**
 * Fetch access-code issuance statuses.
 *
 * This endpoint never returns plaintext
 * access codes or stored hashes.
 */
export async function getVoterAccessCodeStatuses(): Promise<GetVoterAccessCodeStatusesResponse> {
  return callElectionApi<GetVoterAccessCodeStatusesResponse>({
    action: "getVoterAccessCodeStatuses",
    electionId: ELECTION_ID,
  });
}

/**
 * Generate a secure access code for a voter.
 *
 * The Next.js API route:
 * 1. Checks administrator authorization.
 * 2. Generates a cryptographically secure code.
 * 3. Registers its hash through Apps Script.
 * 4. Returns the plaintext code once.
 *
 * IMPORTANT:
 * Never save the returned code to localStorage,
 * sessionStorage, or application logs.
 */
export async function generateVoterAccessCode(
  voterId: Id
): Promise<GenerateVoterAccessCodeResponse> {
  return callElectionApi<GenerateVoterAccessCodeResponse>({
    action: "generateVoterAccessCode",
    electionId: ELECTION_ID,
    voterId,
  });
}

/**
 * Generate access codes for voters who
 * do not already have active codes.
 *
 * The backend processes up to 10 voters
 * per request.
 *
 * Plaintext codes are returned once.
 */
 export async function generateBulkVoterAccessCodes():
 Promise<GenerateBulkVoterAccessCodesResponse> {
 return callElectionApi<GenerateBulkVoterAccessCodesResponse>({
   action: "generateBulkVoterAccessCodes",
   electionId: ELECTION_ID,
 });
}

// =====================================================
// CANDIDATE FUNCTIONS
// =====================================================

export async function getCandidates(): Promise<GetCandidatesResponse> {
  return callElectionApi<GetCandidatesResponse>({
    action: "getCandidates",
    electionId: ELECTION_ID,
  });
}

export async function getAdminCandidates(): Promise<GetAdminCandidatesResponse> {
  return callElectionApi<GetAdminCandidatesResponse>({
    action: "getAdminCandidates",
    electionId: ELECTION_ID,
  });
}

export async function addCandidate(
  name: string,
  position: string,
  location: string,
  image = "",
  runningMate = ""
): Promise<AddCandidateResponse> {
  return callElectionApi<AddCandidateResponse>({
    action: "addCandidate",
    electionId: ELECTION_ID,
    name,
    position,
    location,
    image,
    runningMate,
  });
}

export async function updateCandidate(
  candidateId: Id,
  name: string,
  position: string,
  location: string,
  image = "",
  runningMate = ""
): Promise<UpdateCandidateResponse> {
  return callElectionApi<UpdateCandidateResponse>({
    action: "updateCandidate",
    electionId: ELECTION_ID,
    candidateId,
    name,
    position,
    location,
    image,
    runningMate,
  });
}

export async function deleteCandidate(
  candidateId: Id
): Promise<DeleteCandidateResponse> {
  return callElectionApi<DeleteCandidateResponse>({
    action: "deleteCandidate",
    electionId: ELECTION_ID,
    candidateId,
  });
}

// =====================================================
// VOTING FUNCTIONS
// =====================================================

/**
 * Legacy ballot submission.
 * Disabled in the current backend.
 */

export async function submitBallot(
  voterId: Id,
  selections: BallotSelection[]
): Promise<SubmitBallotResponse> {
  return callElectionApi<SubmitBallotResponse>({
    action: "submitBallot",
    electionId: ELECTION_ID,
    voterId,
    selections,
  });
}

// =====================================================
// RESULTS FUNCTIONS
// =====================================================

export async function getResults(): Promise<GetResultsResponse> {
  return callElectionApi<GetResultsResponse>({
    action: "getResults",
    electionId: ELECTION_ID,
  });
}

// =====================================================
// ANALYTICS FUNCTIONS
// =====================================================

export async function getAnalytics(): Promise<GetAnalyticsResponse> {
  return callElectionApi<GetAnalyticsResponse>({
    action: "getAnalytics",
    electionId: ELECTION_ID,
  });
}

export async function getPollingDashboard(): Promise<GetPollingDashboardResponse> {
  return callElectionApi<GetPollingDashboardResponse>({
    action: "getPollingDashboard",
    electionId: ELECTION_ID,
  });
}

// =====================================================
// ELECTION MANAGEMENT
// =====================================================

export async function getElection(): Promise<GetElectionResponse> {
  return callElectionApi<GetElectionResponse>({
    action: "getElection",
    electionId: ELECTION_ID,
  });
}

export async function getElections(): Promise<GetElectionsResponse> {
  return callElectionApi<GetElectionsResponse>({
    action: "getElections",
  });
}

export async function getElectionReadiness(): Promise<GetElectionReadinessResponse> {
  return callElectionApi<GetElectionReadinessResponse>({
    action: "getElectionReadiness",
    electionId: ELECTION_ID,
  });
}

export async function updateElectionStatus(
  status: ElectionStatus
): Promise<UpdateElectionStatusResponse> {
  return callElectionApi<UpdateElectionStatusResponse>({
    action: "updateElectionStatus",
    electionId: ELECTION_ID,
    status,
  });
}

export async function openElection(): Promise<UpdateElectionStatusResponse> {
  return callElectionApi<UpdateElectionStatusResponse>({
    action: "openElection",
    electionId: ELECTION_ID,
  });
}

export async function closeElection(): Promise<UpdateElectionStatusResponse> {
  return callElectionApi<UpdateElectionStatusResponse>({
    action: "closeElection",
    electionId: ELECTION_ID,
  });
}

export async function publishElectionResults(): Promise<UpdateElectionStatusResponse> {
  return callElectionApi<UpdateElectionStatusResponse>({
    action: "publishElectionResults",
    electionId: ELECTION_ID,
  });
}

export async function hideElectionResults(): Promise<ApiResponse> {
  return callElectionApi<ApiResponse>({
    action: "hideElectionResults",
    electionId: ELECTION_ID,
  });
}

export async function resetElection(
  confirmation: string
): Promise<ResetElectionResponse> {
  return callElectionApi<ResetElectionResponse>({
    action: "resetElection",
    electionId: ELECTION_ID,
    confirmation,
  });
}