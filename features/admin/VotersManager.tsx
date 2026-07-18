"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addVoter,
  AdminVoter,
  getVoters,
} from "@/services/electionService";

export default function VotersManager() {
  const [voters, setVoters] = useState<AdminVoter[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadVoters() {
      try {
        const response = await getVoters();

        if (!response.success) {
          setError(response.message || "Unable to load voters.");
          return;
        }

        setVoters(response.voters);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load voters."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadVoters();
  }, []);

  const filteredVoters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return voters;
    }

    return voters.filter((voter) => {
      return (
        voter.name.toLowerCase().includes(query) ||
        voter.dateOfBirth.includes(query) ||
        String(voter.id).toLowerCase().includes(query)
      );
    });
  }, [search, voters]);

  async function handleAddVoter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!name.trim() || !dateOfBirth) {
      setFormError("Name and date of birth are required.");
      return;
    }

    try {
      setIsAdding(true);

      const response = await addVoter(name.trim(), dateOfBirth);

      if (!response.success || !response.voter) {
        setFormError(response.message || "Unable to add voter.");
        return;
      }

      setVoters((currentVoters) =>
        [...currentVoters, response.voter as AdminVoter].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      setName("");
      setDateOfBirth("");
      setIsModalOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to add voter."
      );
    } finally {
      setIsAdding(false);
    }
  }

  function closeModal() {
    if (isAdding) {
      return;
    }

    setIsModalOpen(false);
    setName("");
    setDateOfBirth("");
    setFormError("");
  }

  if (isLoading) {
    return (
      <Section>
        <Container>
          <p className="text-center text-slate-600">
            Loading voters...
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
              Manage Voters
            </h1>

            <p className="mt-2 text-slate-600">
              View registered voters and their voting status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Add voter
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>
                Registered Voters ({voters.length})
              </CardTitle>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search voter..."
                className="w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 sm:w-72"
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b text-sm text-slate-500">
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">
                      Date of birth
                    </th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">
                      Voted at
                    </th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVoters.map((voter) => (
                    <tr
                      key={voter.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-3 py-4 font-medium text-slate-900">
                        {voter.name}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {voter.dateOfBirth}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={
                            voter.hasVoted
                              ? "rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
                          }
                        >
                          {voter.hasVoted
                            ? "Voted"
                            : "Not voted"}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {voter.votedAt || "—"}
                      </td>

                      <td className="px-3 py-4">
                        <button
                          type="button"
                          className="font-medium text-green-700 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredVoters.length === 0 && (
                <p className="py-10 text-center text-slate-500">
                  No voters found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Add New Voter
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Register a voter for GCR General Elections 2026.
              </p>
            </div>

            {formError && (
              <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddVoter} className="space-y-5">
              <div>
                <label
                  htmlFor="voter-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="voter-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter full name"
                  disabled={isAdding}
                  className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="voter-date-of-birth"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Date of birth
                </label>

                <input
                  id="voter-date-of-birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(event.target.value)
                  }
                  disabled={isAdding}
                  className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isAdding}
                  className="rounded-md border px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAdding}
                  className="rounded-md bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAdding ? "Adding voter..." : "Add voter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Section>
  );
}