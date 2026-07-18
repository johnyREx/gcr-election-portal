export type VotingStep = "verify" | "ballot" | "confirmation";

export interface Voter {
  id: number;
  name: string;
  dateOfBirth: string;
  hasVoted: boolean;
}