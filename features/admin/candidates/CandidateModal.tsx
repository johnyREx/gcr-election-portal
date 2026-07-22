"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import type { CandidateModalProps } from "./types";

export const CANDIDATE_POSITIONS = [
  "President",
  "Vice President",
  "General Secretary",
  "Financial Secretary",
  "Organizing Secretary",
  "Public Relations Officer (PRO)",
  "Women’s Commissioner",
] as const;

export default function CandidateModal({
  open,
  candidate,
  loading,
  onClose,
  onSave,
}: CandidateModalProps) {
  const [name, setName] = useState("");
  const [position, setPosition] =
    useState<string>(
      CANDIDATE_POSITIONS[0]
    );
  const [location, setLocation] =
    useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (candidate) {
      setName(candidate.name);
      setPosition(candidate.position);
      setLocation(candidate.location);
      setImage(candidate.image || "");
    } else {
      setName("");
      setPosition(
        CANDIDATE_POSITIONS[0]
      );
      setLocation("");
      setImage("");
    }

    setError("");
  }, [candidate, open]);

  if (!open) {
    return null;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Candidate name is required."
      );
      return;
    }

    if (
      !CANDIDATE_POSITIONS.includes(
        position as
          (typeof CANDIDATE_POSITIONS)[number]
      )
    ) {
      setError(
        "Please select a valid position."
      );
      return;
    }

    if (!location.trim()) {
      setError("Location is required.");
      return;
    }

    setError("");

    onSave({
      name: name.trim(),
      position,
      location: location.trim(),
      image: image.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
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
              className="w-full rounded-md border px-4 py-3"
            />
          </div>

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
                setPosition(
                  event.target.value
                );
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
                setLocation(
                  event.target.value
                );
                setError("");
              }}
              disabled={loading}
              placeholder="Moscow"
              className="w-full rounded-md border px-4 py-3"
            />
          </div>

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