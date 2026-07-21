"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  addCandidate,
  AdminCandidate,
  deleteCandidate,
  getAdminCandidates,
  updateCandidate,
} from "@/services/electionService";

import CandidateModal from "./CandidateModal";
import CandidateTable from "./CandidateTable";

interface CandidateFormData {
  name: string;
  position: string;
  location: string;
  image: string;
}

export default function CandidateManager() {
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingCandidateId, setDeletingCandidateId] = useState<
    string | number | null
  >(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingCandidate, setEditingCandidate] =
    useState<AdminCandidate | null>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadCandidates() {
      try {
        const response = await getAdminCandidates();

        if (!response.success) {
          setError(response.message || "Unable to load candidates.");
          return;
        }

        setCandidates(
          [...response.candidates].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load candidates."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      return (
        candidate.name.toLowerCase().includes(query) ||
        candidate.position.toLowerCase().includes(query) ||
        candidate.location.toLowerCase().includes(query) ||
        String(candidate.id).toLowerCase().includes(query)
      );
    });
  }, [candidates, search]);

  function openAddModal() {
    setEditingCandidate(null);
    setError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(candidate: AdminCandidate) {
    setEditingCandidate(candidate);
    setError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingCandidate(null);
  }

  async function handleSave(data: CandidateFormData) {
    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingCandidate) {
        const response = await updateCandidate(
          editingCandidate.id,
          data.name,
          data.position,
          data.location,
          data.image
        );

        if (!response.success || !response.candidate) {
          setError(
            response.message || "Unable to update candidate."
          );
          return;
        }

        const updatedCandidate = response.candidate;

        setCandidates((currentCandidates) =>
          currentCandidates
            .map((candidate) =>
              String(candidate.id) === String(updatedCandidate.id)
                ? updatedCandidate
                : candidate
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );

        setSuccessMessage("Candidate updated successfully.");
      } else {
        const response = await addCandidate(
          data.name,
          data.position,
          data.location,
          data.image
        );

        if (!response.success || !response.candidate) {
          setError(response.message || "Unable to add candidate.");
          return;
        }

        const newCandidate = response.candidate;

        setCandidates((currentCandidates) =>
          [...currentCandidates, newCandidate].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );

        setSuccessMessage("Candidate added successfully.");
      }

      setIsModalOpen(false);
      setEditingCandidate(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : editingCandidate
            ? "Unable to update candidate."
            : "Unable to add candidate."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(candidate: AdminCandidate) {
    const confirmed = window.confirm(
      `Delete ${candidate.name} from the ${candidate.position} race?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCandidateId(candidate.id);
      setError("");
      setSuccessMessage("");

      const response = await deleteCandidate(candidate.id);

      if (!response.success) {
        setError(response.message || "Unable to delete candidate.");
        return;
      }

      setCandidates((currentCandidates) =>
        currentCandidates.filter(
          (currentCandidate) =>
            String(currentCandidate.id) !== String(candidate.id)
        )
      );

      setSuccessMessage(
        `${candidate.name} was deleted successfully.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete candidate."
      );
    } finally {
      setDeletingCandidateId(null);
    }
  }

  if (isLoading) {
    return (
      <Section>
        <Container>
          <p className="text-center text-slate-600">
            Loading candidates...
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-green-700 hover:underline"
            >
              ← Back to dashboard
            </Link>

            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Manage Candidates
            </h1>

            <p className="mt-2 text-slate-600">
              Add, edit and manage election candidates.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-800"
          >
            Add Candidate
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>
                Candidates ({candidates.length})
              </CardTitle>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidates..."
                className="w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 sm:w-72"
              />
            </div>
          </CardHeader>

          <CardContent>
            <CandidateTable
              candidates={filteredCandidates}
              deletingCandidateId={deletingCandidateId}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </Container>

      <CandidateModal
        open={isModalOpen}
        candidate={editingCandidate}
        loading={isSaving}
        onClose={closeModal}
        onSave={handleSave}
      />
    </Section>
  );
}