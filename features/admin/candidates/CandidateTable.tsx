"use client";

import type { CandidateTableProps } from "./types";

export default function CandidateTable({
  candidates,
  deletingCandidateId,
  onEdit,
  onDelete,
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
            <th className="px-3 py-3 font-medium">
              Photo
            </th>
            <th className="px-3 py-3 font-medium">
              Name
            </th>
            <th className="px-3 py-3 font-medium">
              Position
            </th>
            <th className="px-3 py-3 font-medium">
              Location
            </th>
            <th className="px-3 py-3 font-medium">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {candidates.map((candidate) => {
            const isDeleting =
              String(deletingCandidateId) ===
              String(candidate.id);

            return (
              <tr
                key={String(candidate.id)}
                className="border-b last:border-b-0"
              >
                <td className="px-3 py-4">
                  {candidate.image ? (
                    <img
                      src={candidate.image}
                      alt={`${candidate.name} portrait`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-500">
                      {candidate.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) =>
                          part.charAt(0)
                        )
                        .join("")
                        .toUpperCase()}
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
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(candidate)
                      }
                      disabled={isDeleting}
                      className="font-medium text-green-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(candidate)
                      }
                      disabled={isDeleting}
                      className="font-medium text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}