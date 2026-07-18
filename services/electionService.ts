export interface VoterSearchResult {
    id: number;
    name: string;
  }
  
  export interface ElectionCandidate {
    id: number;
    name: string;
    position: string;
    location: string;
    image?: string;
  }
  
  export interface BallotSelection {
    position: string;
    candidateId: number;
  }
  
  interface ApiResponse {
    success: boolean;
    message?: string;
  }
  
  interface SearchVotersResponse extends ApiResponse {
    voters: VoterSearchResult[];
  }
  
  interface VerifyVoterResponse extends ApiResponse {
    voter?: VoterSearchResult;
  }
  
  interface GetCandidatesResponse extends ApiResponse {
    candidates: ElectionCandidate[];
  }
  
  interface SubmitBallotResponse extends ApiResponse {
    reference?: string;
  }
  
  async function callElectionApi<T>(body: object): Promise<T> {
    const response = await fetch("/api/election", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || "Election server request failed.");
    }
  
    return data;
  }
  
  export async function searchVoters(
    query: string
  ): Promise<SearchVotersResponse> {
    return callElectionApi<SearchVotersResponse>({
      action: "searchVoters",
      electionId: "gcr-2026",
      query,
    });
  }
  
  export async function verifyVoter(
    voterId: number,
    dateOfBirth: string
  ): Promise<VerifyVoterResponse> {
    return callElectionApi<VerifyVoterResponse>({
      action: "verifyVoter",
      electionId: "gcr-2026",
      voterId,
      dateOfBirth,
    });
  }
  
  export async function getCandidates(): Promise<GetCandidatesResponse> {
    return callElectionApi<GetCandidatesResponse>({
      action: "getCandidates",
      electionId: "gcr-2026",
    });
  }
  
  export async function submitBallot(
    voterId: number,
    selections: BallotSelection[]
  ): Promise<SubmitBallotResponse> {
    return callElectionApi<SubmitBallotResponse>({
      action: "submitBallot",
      electionId: "gcr-2026",
      voterId,
      selections,
    });
  }