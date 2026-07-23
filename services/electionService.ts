const ELECTION_ID = "gcr-2026";

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

interface ApiResponse {
  success: boolean;
  message?: string;
}

export type Id = string | number;

export interface VoterSearchResult {
  id: Id;
  name: string;
  location?: string;
}

export interface VerifiedVoter {
  id: Id;
  electionId: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  location?: string;
  hasVoted: boolean;
  votedAt?: string;
}

export interface ElectionCandidate {
  id: Id;
  electionId?: string;
  name: string;
  position: string;
  location: string;
  image?: string;
}

export interface BallotSelection {
  position: string;
  candidateId: Id;
}

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

export interface AdminVoter {
  id: Id;
  electionId: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  location: string;
  hasVoted: boolean;
  votedAt: string;
}

export interface VoterInput {
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  location?: string;
}

export interface VoterImportRecord extends VoterInput {}

export interface VoterImportError {
  row: number;
  message: string;
}

export interface AdminCandidate extends ElectionCandidate {
  electionId: string;
  image: string;
}

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

interface SearchVotersResponse extends ApiResponse {
  voters: VoterSearchResult[];
}

interface VerifyVoterResponse extends ApiResponse {
  voter?: VerifiedVoter;
}

interface GetCandidatesResponse extends ApiResponse {
  candidates: ElectionCandidate[];
}

interface SubmitBallotResponse extends ApiResponse {
  reference?: string;
}

interface GetResultsResponse extends ApiResponse {
  summary: ResultsSummary;
  results: PositionResult[];
}

interface ResetElectionResponse extends ApiResponse {
  deletedVoteCount: number;
  resetVoterCount: number;
}

interface GetVotersResponse extends ApiResponse {
  voters: AdminVoter[];
}

interface AddVoterResponse extends ApiResponse {
  voter?: AdminVoter;
}

interface UpdateVoterResponse extends ApiResponse {
  voter?: AdminVoter;
}

interface ImportVotersResponse extends ApiResponse {
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: VoterImportError[];
  voters: AdminVoter[];
}

interface GetAdminCandidatesResponse extends ApiResponse {
  candidates: AdminCandidate[];
}

interface AddCandidateResponse extends ApiResponse {
  candidate?: AdminCandidate;
}

interface UpdateCandidateResponse extends ApiResponse {
  candidate?: AdminCandidate;
}

interface DeleteCandidateResponse extends ApiResponse {
  candidateId?: Id;
}

interface GetElectionResponse extends ApiResponse {
  election?: Election;
}

interface GetElectionsResponse extends ApiResponse {
  elections: Election[];
}

interface UpdateElectionStatusResponse extends ApiResponse {
  election?: Election;
}

interface GetAnalyticsResponse extends ApiResponse {
  electionId: string;
  analytics: ElectionAnalytics;
}

interface GetPollingDashboardResponse extends ApiResponse {
  electionId: string;
  dashboard: {
    summary: TurnoutSummary;
    gender: GenderAnalytics[];
    locations: LocationAnalytics[];
    votingActivity: VotingActivity[];
  };
}

function getAdminToken() {
    if (typeof window === "undefined") {
      return "";
    }
  
    return (
      window.sessionStorage.getItem(
        "gcr-admin-token"
      ) || ""
    );
  }

  async function callElectionApi<T extends ApiResponse>(
    body: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch("/api/election", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        adminToken: getAdminToken(),
      }),
      cache: "no-store",
    });
  
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
        data.message || "Election server request failed."
      );
    }
  
    return data;
  }

// Voters

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

// Candidates

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
  image = ""
): Promise<AddCandidateResponse> {
  return callElectionApi<AddCandidateResponse>({
    action: "addCandidate",
    electionId: ELECTION_ID,
    name,
    position,
    location,
    image,
  });
}

export async function updateCandidate(
  candidateId: Id,
  name: string,
  position: string,
  location: string,
  image = ""
): Promise<UpdateCandidateResponse> {
  return callElectionApi<UpdateCandidateResponse>({
    action: "updateCandidate",
    electionId: ELECTION_ID,
    candidateId,
    name,
    position,
    location,
    image,
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

// Voting

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

// Results

export async function getResults(): Promise<GetResultsResponse> {
  return callElectionApi<GetResultsResponse>({
    action: "getResults",
    electionId: ELECTION_ID,
  });
}

// Analytics

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

// Election management

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