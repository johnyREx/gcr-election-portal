"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import type { CandidateModalProps } from "./types";

// =====================================================
// OFFICIAL ACGC ELECTORAL POSITIONS
// =====================================================

export const CANDIDATE_POSITIONS = [
  "President",
  "General Secretary",
  "Financial Secretary",
  "Organizing Secretary",
  "Public Relations Officer (PRO)",
  "Women’s Commissioner",
] as const;

// =====================================================
// CANDIDATE MODAL
// =====================================================

export default function CandidateModal({
  open,
  candidate,
  loading,
  onClose,
  onSave,
}: CandidateModalProps) {
  const [name, setName] = useState("");

  const [position, setPosition] =
    useState<string>(CANDIDATE_POSITIONS[0]);

  const [runningMate, setRunningMate] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [image, setImage] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // LOAD CANDIDATE DATA
  // =====================================================

  useEffect(() => {
    if (candidate) {
      setName(candidate.name);
      setPosition(candidate.position);
      setRunningMate(candidate.runningMate || "");
      setLocation(candidate.location || "");
      setImage(candidate.image || "");
    } else {
      setName("");
      setPosition(CANDIDATE_POSITIONS[0]);
      setRunningMate("");
      setLocation("");
      setImage("");
    }

    setError("");
  }, [candidate, open]);

  if (!open) {
    return null;
  }

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Candidate name is required.");
      return;
    }

    if (
      !CANDIDATE_POSITIONS.includes(
        position as
          (typeof CANDIDATE_POSITIONS)[number]
      )
    ) {
      setError("Please select a valid position.");
      return;
    }

    // Presidential candidates must have a running mate.
    if (
      position === "President" &&
      !runningMate.trim()
    ) {
      setError(
        "A presidential candidate must have a running mate."
      );
      return;
    }

    setError("");

    onSave({
      name: name.trim(),
      position,
      location: location.trim(),
      image: image.trim(),

      // Only presidential candidates have running mates.
      runningMate:
        position === "President"
          ? runningMate.trim()
          : "",
    });
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-modal-title"
    >
      <div className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2
            id="candidate-modal-title"
            className="text-2xl font-bold text-slate-900"
          >
            {candidate
              ? "Edit Candidate"
              : "Add Candidate"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {candidate
              ? "Update candidate information."
              : "Register a new election candidate."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-md bg-red-50 px-4 py-3 text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* CANDIDATE NAME */}
          <div>
            <label
              htmlFor="candidate-name"
              className="mb-2 block text-sm font-medium"
            >
              Full Name
            </label>

            <input
              id="candidate-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              disabled={loading}
              autoFocus
              required
              className="w-full rounded-md border px-4 py-3"
            />
          </div>

          {/* POSITION */}
          <div>
            <label
              htmlFor="candidate-position"
              className="mb-2 block text-sm font-medium"
            >
              Position
            </label>

            <select
              id="candidate-position"
              value={position}
              onChange={(event) => {
                setPosition(event.target.value);
                setError("");
              }}
              disabled={loading}
              className="w-full rounded-md border px-4 py-3"
            >
              {CANDIDATE_POSITIONS.map(
                (candidatePosition) => (
                  <option
                    key={candidatePosition}
                    value={candidatePosition}
                  >
                    {candidatePosition}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PRESIDENTIAL RUNNING MATE */}
          {position === "President" && (
            <div>
              <label
                htmlFor="candidate-running-mate"
                className="mb-2 block text-sm font-medium"
              >
                Running Mate
              </label>

              <input
                id="candidate-running-mate"
                value={runningMate}
                onChange={(event) => {
                  setRunningMate(event.target.value);
                  setError("");
                }}
                disabled={loading}
                placeholder="Enter running mate's full name"
                required
                className="w-full rounded-md border px-4 py-3"
              />

              <p className="mt-2 text-xs text-slate-500">
                The running mate will be displayed
                alongside the presidential candidate.
              </p>
            </div>
          )}

          {/* LOCATION */}
          <div>
            <label
              htmlFor="candidate-location"
              className="mb-2 block text-sm font-medium"
            >
              Location
            </label>

            <input
              id="candidate-location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setError("");
              }}
              disabled={loading}
              placeholder="Optional - e.g. Moscow"
              required
              className="w-full rounded-md border px-4 py-3"
            />
          </div>

          {/* IMAGE */}
          <div>
            <label
              htmlFor="candidate-image"
              className="mb-2 block text-sm font-medium"
            >
              Image URL
            </label>

            <input
              id="candidate-image"
              type="url"
              value={image}
              onChange={(event) => {
                setImage(event.target.value);
                setError("");
              }}
              disabled={loading}
              placeholder="https://..."
              className="w-full rounded-md border px-4 py-3"
            />

            <p className="mt-2 text-xs text-slate-500">
              Optional. Leave blank to use the
              default placeholder.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : candidate
                  ? "Save Changes"
                  : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}