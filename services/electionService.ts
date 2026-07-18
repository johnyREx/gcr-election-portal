interface VoterSearchResult {
    id: number;
    name: string;
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
  
  interface SubmitVoteResponse extends ApiResponse {
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
  
  export async function submitVote(
    voterId: number,
    candidateId: number
  ): Promise<SubmitVoteResponse> {
    return callElectionApi<SubmitVoteResponse>({
      action: "submitVote",
      electionId: "gcr-2026",
      voterId,
      position: "President",
      candidateId,
    });
  }