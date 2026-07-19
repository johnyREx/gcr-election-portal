"use client";

import { AdminCandidate } from "@/services/electionService";

interface CandidateTableProps {
  candidates: AdminCandidate[];
  onEdit: (candidate: AdminCandidate) => void;
}

export default function CandidateTable({
  candidates,
  onEdit,
}: CandidateTableProps) {
  if (candidates.length === 0) {
    return (
      <p className="py-10 text-center text-slate-500">
        No candidates found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left">
        <thead>
          <tr className="border-b text-sm text-slate-500">
            <th className="px-3 py-3 font-medium">Photo</th>
            <th className="px-3 py-3 font-medium">Name</th>
            <th className="px-3 py-3 font-medium">Position</th>
            <th className="px-3 py-3 font-medium">Location</th>
            <th className="px-3 py-3 font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              className="border-b last:border-b-0"
            >
              <td className="px-3 py-4">
                {candidate.image ? (
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500">
                    N/A
                  </div>
                )}
              </td>

              <td className="px-3 py-4 font-medium text-slate-900">
                {candidate.name}
              </td>

              <td className="px-3 py-4 text-slate-600">
                {candidate.position}
              </td>

              <td className="px-3 py-4 text-slate-600">
                {candidate.location}
              </td>

              <td className="px-3 py-4">
                <button
                  type="button"
                  onClick={() => onEdit(candidate)}
                  className="font-medium text-green-700 hover:underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}