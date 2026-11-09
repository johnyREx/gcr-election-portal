import type {
  AdminCandidate,
  Id,
} from "@/services/electionService";

// =====================================================
// CANDIDATE FORM
// =====================================================

export interface CandidateFormData {
  name: string;
  position: string;
  location: string;
  image: string;
  runningMate: string;
}

// =====================================================
// CANDIDATE TABLE
// =====================================================

export interface CandidateTableProps {
  candidates: AdminCandidate[];
  deletingCandidateId: Id | null;

  onEdit(candidate: AdminCandidate): void;
  onDelete(candidate: AdminCandidate): void;
}

// =====================================================
// CANDIDATE MODAL
// =====================================================

export interface CandidateModalProps {
  open: boolean;
  candidate: AdminCandidate | null;
  loading: boolean;

  onClose(): void;
  onSave(data: CandidateFormData): void;
}