import type { Id } from "@/services/electionService";

export type VotingStep =
  | "verify"
  | "ballot"
  | "confirmation";

export interface VerifiedVotingVoter {
  id: Id;
  name: string;
}

export interface BallotConfirmation {
  reference?: string;
}