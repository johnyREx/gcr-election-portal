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
  updateCandidate,
  getAdminCandidates,
  AdminCandidate,
} from "@/services/electionService";

import CandidateTable from "./CandidateTable";
import CandidateModal from "./CandidateModal";

export default function CandidateManager() {
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] =
    useState<AdminCandidate | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    try {
      setLoading(true);

      const response = await getAdminCandidates();

      if (!response.success) {
        setError(response.message || "Unable to load candidates.");
        return;
      }

      setCandidates(response.candidates);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load candidates."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      return (
        candidate.name.toLowerCase().includes(query) ||
        candidate.position.toLowerCase().includes(query) ||
        candidate.location.toLowerCase().includes(query)
      );
    });
  }, [search, candidates]);

  function openAddModal() {
    setEditingCandidate(null);
    setModalOpen(true);
  }

  function openEditModal(candidate: AdminCandidate) {
    setEditingCandidate(candidate);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingCandidate(null);
  }

  async function handleSave(data: {
    name: string;
    position: string;
    location: string;
    image: string;
  }) {
    try {
      setSaving(true);

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

        const updated = response.candidate;

        setCandidates((current) =>
          current
            .map((candidate) =>
              String(candidate.id) === String(updated.id)
                ? updated
                : candidate
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );

        setSuccess("Candidate updated successfully.");
      } else {
        const response = await addCandidate(
          data.name,
          data.position,
          data.location,
          data.image
        );

        if (!response.success || !response.candidate) {
          setError(
            response.message || "Unable to add candidate."
          );
          return;
        }

        const created = response.candidate;

        setCandidates((current) =>
          [...current, created].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );

        setSuccess("Candidate added successfully.");
      }

      setError("");
      closeModal();
    } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : editingCandidate
            ? "Unable to update candidate."
            : "Unable to add candidate."
        );
      } finally {
        setSaving(false);
      }
    }
  
    if (loading) {
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
              className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Add Candidate
            </button>
          </div>
  
          {error && (
            <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}
  
          {success && (
            <div className="mb-6 rounded-md bg-green-50 px-4 py-3 text-green-700">
              {success}
            </div>
          )}
  
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>
                  Candidates ({filteredCandidates.length})
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
                onEdit={openEditModal}
              />
            </CardContent>
          </Card>
  
          <CandidateModal
            open={modalOpen}
            candidate={editingCandidate}
            loading={saving}
            onClose={closeModal}
            onSave={handleSave}
          />
        </Container>
      </Section>
    );
  }