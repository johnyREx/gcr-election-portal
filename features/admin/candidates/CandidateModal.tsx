"use client";

import { useEffect, useState } from "react";

import { AdminCandidate } from "@/services/electionService";

interface CandidateModalProps {
  open: boolean;
  candidate: AdminCandidate | null;
  loading: boolean;
  onClose(): void;
  onSave(data: {
    name: string;
    position: string;
    location: string;
    image: string;
  }): void;
}

const POSITIONS = [
  "President",
  "General Secretary",
];

export default function CandidateModal({
  open,
  candidate,
  loading,
  onClose,
  onSave,
}: CandidateModalProps) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState(POSITIONS[0]);
  const [location, setLocation] = useState("");
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
      setPosition(POSITIONS[0]);
      setLocation("");
      setImage("");
    }

    setError("");
  }, [candidate, open]);

  if (!open) {
    return null;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Candidate name is required.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {candidate ? "Edit Candidate" : "Add Candidate"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {candidate
              ? "Update candidate information."
              : "Register a new election candidate."}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-md bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Position
            </label>

            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border px-4 py-3"
            >
              {POSITIONS.map((position) => (
                <option
                  key={position}
                  value={position}
                >
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Location
            </label>

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Image URL
            </label>

            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              disabled={loading}
              placeholder="https://..."
              className="w-full rounded-md border px-4 py-3"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
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