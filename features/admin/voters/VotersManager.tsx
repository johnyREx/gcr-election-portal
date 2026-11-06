"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  generateVoterAccessCode,
  getVoterAccessCodeStatuses,
  getVoters,
  updateVoter,
  VoterAccessCodeStatus,
  VoterInput,
} from "@/services/electionService";

import CsvImportButton from "./CsvImportButton";

const GENDER_OPTIONS = ["Male", "Female"] as const;

const CITY_OPTIONS = [
  "Moscow",
  "Saint Petersburg",
  "Kazan",
  "Voronezh",
  "Other",
];

type GeneratedCode = {
  voterId: string;
  voterName: string;
  accessCode: string;
};

export default function VotersManager() {
  // =====================================================
  // VOTER STATE
  // =====================================================

  const [voters, setVoters] = useState<AdminVoter[]>([]);
  const [search, setSearch] = useState("");

  const [accessCodes, setAccessCodes] = useState<
    VoterAccessCodeStatus[]
  >([]);

  const [accessCodesLoaded, setAccessCodesLoaded] =
    useState(false);

  const [accessCodeError, setAccessCodeError] =
    useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingVoter, setEditingVoter] =
    useState<AdminVoter | null>(null);

  const [name, setName] = useState("");

  const [gender, setGender] =
    useState<VoterInput["gender"]>("Male");

  const [location, setLocation] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");
  const [formError, setFormError] = useState("");

  // =====================================================
  // ACCESS-CODE GENERATION STATE
  // =====================================================

  const [selectedVoter, setSelectedVoter] =
    useState<AdminVoter | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const generatingRef = useRef(false);

  const [generationError, setGenerationError] =
    useState("");

  const [generatedCode, setGeneratedCode] =
    useState<GeneratedCode | null>(null);

  const [codeCopied, setCodeCopied] =
    useState(false);

  // =====================================================
  // LOAD VOTERS
  // =====================================================

  const loadVoters = useCallback(async () => {
    try {
      setError("");

      const response = await getVoters();

      setVoters(
        [...response.voters].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load voters."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD ACCESS-CODE STATUSES
  // =====================================================

  const loadAccessCodes = useCallback(async () => {
    try {
      setAccessCodeError("");
      setAccessCodesLoaded(false);

      const response =
        await getVoterAccessCodeStatuses();

      setAccessCodes(response.codes || []);
      setAccessCodesLoaded(true);
    } catch (caughtError) {
      setAccessCodes([]);
      setAccessCodesLoaded(false);

      setAccessCodeError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load access-code statuses."
      );
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([
        loadVoters(),
        loadAccessCodes(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadVoters, loadAccessCodes]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  // =====================================================
  // ACCESS-CODE LOOKUP
  // =====================================================

  const accessCodeByVoter = useMemo(() => {
    const lookup = new Map<
      string,
      VoterAccessCodeStatus
    >();

    for (const record of accessCodes) {
      const voterId = String(record.voterId);
      const existing = lookup.get(voterId);

      if (
        !existing ||
        record.status === "ACTIVE"
      ) {
        lookup.set(voterId, record);
      }
    }

    return lookup;
  }, [accessCodes]);

  function hasActiveCode(voterId: string | number) {
    return (
      accessCodeByVoter.get(String(voterId))
        ?.status === "ACTIVE"
    );
  }

  const issuedCount = voters.filter((voter) =>
    hasActiveCode(voter.id)
  ).length;

  // =====================================================
  // SEARCH AND STATISTICS
  // =====================================================

  const filteredVoters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return voters;
    }

    return voters.filter((voter) => {
      return (
        voter.name.toLowerCase().includes(query) ||
        voter.gender.toLowerCase().includes(query) ||
        voter.location.toLowerCase().includes(query) ||
        String(voter.id).toLowerCase().includes(query)
      );
    });
  }, [search, voters]);

  const maleCount = voters.filter(
    (voter) => voter.gender === "Male"
  ).length;

  const femaleCount = voters.filter(
    (voter) => voter.gender === "Female"
  ).length;

  const votedCount = voters.filter(
    (voter) => voter.hasVoted
  ).length;

  // =====================================================
  // ADD / EDIT MODAL
  // =====================================================

  function openAddModal() {
    setEditingVoter(null);
    setName("");
    setGender("Male");
    setLocation("");
    setFormError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(voter: AdminVoter) {
    setEditingVoter(voter);
    setName(voter.name);

    setGender(
      voter.gender === "Female"
        ? "Female"
        : "Male"
    );

    setLocation(voter.location);
    setFormError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingVoter(null);
    setName("");
    setGender("Male");
    setLocation("");
    setFormError("");
  }

  // =====================================================
  // CSV IMPORT
  // =====================================================

  function handleImportComplete(
    _importedVoters: AdminVoter[]
  ) {
    void refreshData();
    setError("");
  }

  function handleImportMessage(message: string) {
    setSuccessMessage(message);
    setError("");
  }

  function handleImportError(message: string) {
    setError(message);
    setSuccessMessage("");
  }

  // =====================================================
  // ADD / UPDATE VOTER
  // =====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setFormError("Full name is required.");
      return;
    }

    if (!location) {
      setFormError("Please select a city.");
      return;
    }

    if (
      editingVoter &&
      hasActiveCode(editingVoter.id) &&
      name.trim() !== editingVoter.name
    ) {
      setFormError(
        "This voter already has an active access code. Their name cannot be changed."
      );
      return;
    }

    const voterInput: VoterInput = {
      name: name.trim(),
      gender,
      location,
    };

    try {
      setIsSaving(true);

      if (editingVoter) {
        const response = await updateVoter(
          editingVoter.id,
          voterInput
        );

        if (!response.voter) {
          setFormError(
            response.message ||
              "Unable to update voter."
          );
          return;
        }

        setSuccessMessage(
          "Voter updated successfully."
        );
      } else {
        const response = await addVoter(
          voterInput
        );

        if (!response.voter) {
          setFormError(
            response.message ||
              "Unable to add voter."
          );
          return;
        }

        setSuccessMessage(
          "Voter registered successfully."
        );
      }

      setIsModalOpen(false);
      setEditingVoter(null);

      await refreshData();
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save voter."
      );
    } finally {
      setIsSaving(false);
    }
  }

  // =====================================================
  // OPEN GENERATE CODE CONFIRMATION
  // =====================================================

  function openGenerateCodeModal(voter: AdminVoter) {
    if (
      !accessCodesLoaded ||
      hasActiveCode(voter.id) ||
      voter.hasVoted ||
      isGenerating ||
      generatedCode
    ) {
      return;
    }

    setSelectedVoter(voter);
    setGenerationError("");
    setCodeCopied(false);
    setSuccessMessage("");
  }

  function closeGenerateCodeModal() {
    if (isGenerating) {
      return;
    }

    setSelectedVoter(null);
    setGenerationError("");
  }

  // =====================================================
  // GENERATE ACCESS CODE
  // =====================================================

  async function handleGenerateCode() {
    if (
      !selectedVoter ||
      generatingRef.current ||
      generatedCode
    ) {
      return;
    }

    const voter = selectedVoter;

    generatingRef.current = true;
    setIsGenerating(true);
    setGenerationError("");

    try {
      // Recheck current issuance status before
      // attempting to create a credential.
      const statusResponse =
        await getVoterAccessCodeStatuses();

      const alreadyIssued =
        statusResponse.codes.some(
          (record) =>
            String(record.voterId) ===
              String(voter.id) &&
            record.status === "ACTIVE"
        );

      setAccessCodes(statusResponse.codes);
      setAccessCodesLoaded(true);

      if (alreadyIssued) {
        setGenerationError(
          "This voter already has an active access code."
        );
        return;
      }

      const response =
        await generateVoterAccessCode(voter.id);

      if (!response.accessCode) {
        throw new Error(
          "The server did not return the generated access code."
        );
      }

      // Keep the plaintext credential in
      // component memory only.
      setGeneratedCode({
        voterId: String(voter.id),
        voterName: voter.name,
        accessCode: response.accessCode,
      });

      setSelectedVoter(null);
      setCodeCopied(false);

      // Refresh the status without clearing
      // the generated credential.
      void loadAccessCodes();
    } catch (caughtError) {
      setGenerationError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate access code."
      );
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  }

  // =====================================================
  // COPY GENERATED CODE
  // =====================================================

  async function handleCopyCode() {
    if (!generatedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedCode.accessCode
      );

      setCodeCopied(true);
    } catch {
      setCodeCopied(false);
    }
  }

  // =====================================================
  // CLOSE ONE-TIME CODE DISPLAY
  // =====================================================

  function closeGeneratedCodeModal() {
    if (!generatedCode) {
      return;
    }

    const confirmed = window.confirm(
      "Have you copied and securely shared this access code?\n\n" +
        "Once you close this window, the code cannot be retrieved again."
    );

    if (!confirmed) {
      return;
    }

    // Clear the plaintext credential from
    // React component state.
    setGeneratedCode(null);
    setCodeCopied(false);

    setSuccessMessage(
      "Access code issued successfully."
    );

    void loadAccessCodes();
  }

  // =====================================================
  // ACCESS-CODE BADGE
  // =====================================================

  function renderAccessCodeStatus(
    voter: AdminVoter
  ) {
    if (!accessCodesLoaded) {
      return (
        <span className="text-sm text-amber-700">
          Unavailable
        </span>
      );
    }

    const record = accessCodeByVoter.get(
      String(voter.id)
    );

    if (!record) {
      return (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          Not Issued
        </span>
      );
    }

    const status = record.status;

    if (status === "ACTIVE") {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          Issued
        </span>
      );
    }

    if (status === "USED") {
      return (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          Used
        </span>
      );
    }

    if (status === "REVOKED") {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
          Revoked
        </span>
      );
    }

    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
        {status || "Unknown"}
      </span>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

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

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <Section className="bg-slate-50">
      <Container>
        {/* PAGE HEADER */}

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
              Manage voter registration,
              demographics, access codes,
              and voting participation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refreshData()}
              disabled={isRefreshing || isGenerating}
              className="rounded-md border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <CsvImportButton
              onImportComplete={handleImportComplete}
              onMessage={handleImportMessage}
              onError={handleImportError}
            />

            <button
              type="button"
              onClick={openAddModal}
              className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              + Add voter
            </button>
          </div>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {accessCodeError && (
          <div className="mb-6 rounded-md bg-amber-50 px-4 py-3 text-amber-800">
            Access-code statuses could not be
            loaded: {accessCodeError}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "Registered Voters",
              value: voters.length,
            },
            {
              label: "Male Voters",
              value: maleCount,
            },
            {
              label: "Female Voters",
              value: femaleCount,
            },
            {
              label: "Access Codes Issued",
              value: accessCodesLoaded
                ? issuedCount
                : "—",
            },
            {
              label: "Votes Cast",
              value: votedCount,
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">
                  {item.label}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* VOTER TABLE */}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>
                Registered Voters ({voters.length})
              </CardTitle>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name, city, gender or ID..."
                className="w-full rounded-md border px-4 py-2 outline-none focus:ring-2 focus:ring-green-700 sm:w-80"
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead>
                  <tr className="border-b text-sm text-slate-500">
                    <th className="px-3 py-3 font-medium">
                      Name
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Gender
                    </th>

                    <th className="px-3 py-3 font-medium">
                      City
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Access Code
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Voting Status
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Voted At
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVoters.map((voter) => {
                    const activeCode =
                      hasActiveCode(voter.id);

                    const canGenerate =
                      accessCodesLoaded &&
                      !activeCode &&
                      !voter.hasVoted &&
                      !isGenerating &&
                      !generatedCode;

                    return (
                      <tr
                        key={voter.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-3 py-4 font-medium text-slate-900">
                          {voter.name}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {voter.gender || "—"}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {voter.location || "—"}
                        </td>

                        <td className="px-3 py-4">
                          {renderAccessCodeStatus(
                            voter
                          )}
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
                          <div className="flex flex-col items-start gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(voter)
                              }
                              disabled={voter.hasVoted}
                              className="font-medium text-green-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              Edit
                            </button>

                            {activeCode ? (
                              <span className="text-xs font-medium text-green-700">
                                Code Issued
                              </span>
                            ) : voter.hasVoted ? (
                              <span className="text-xs text-slate-400">
                                Voting completed
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openGenerateCodeModal(
                                    voter
                                  )
                                }
                                disabled={!canGenerate}
                                className="rounded-md border border-green-700 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Generate Code
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* =================================================
          ADD / EDIT VOTER MODAL
      ================================================= */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingVoter
                  ? "Edit Voter"
                  : "Register New Voter"}
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {editingVoter
                  ? "Update voter registration details."
                  : "Register a voter for the ACGC Election."}
              </p>
            </div>

            {formError && (
              <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* NAME */}

              <div>
                <label
                  htmlFor="voter-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="voter-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter full name"
                  disabled={
                    isSaving ||
                    Boolean(
                      editingVoter &&
                      hasActiveCode(editingVoter.id)
                    )
                  }
                  className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-60"
                />

                {editingVoter &&
                  hasActiveCode(editingVoter.id) && (
                    <p className="mt-2 text-xs text-amber-700">
                      Name changes are disabled
                      after an access code has been
                      issued.
                    </p>
                  )}
              </div>

              {/* GENDER */}

              <div>
                <label
                  htmlFor="voter-gender"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Gender
                </label>

                <select
                  id="voter-gender"
                  value={gender}
                  onChange={(event) =>
                    setGender(
                      event.target.value as VoterInput["gender"]
                    )
                  }
                  disabled={isSaving}
                  className="w-full rounded-md border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-60"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* CITY */}

              <div>
                <label
                  htmlFor="voter-city"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  City
                </label>

                <select
                  id="voter-city"
                  required
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  disabled={isSaving}
                  className="w-full rounded-md border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-60"
                >
                  <option value="">
                    Select city
                  </option>

                  {CITY_OPTIONS.map((city) => (
                    <option
                      key={city}
                      value={city}
                    >
                      {city}
                    </option>
                  ))}

                  {location &&
                    !CITY_OPTIONS.includes(location) && (
                      <option value={location}>
                        {location}
                      </option>
                    )}
                </select>
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-md border px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : editingVoter
                      ? "Save Changes"
                      : "Register Voter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          GENERATE CODE CONFIRMATION MODAL
      ================================================= */}

      {selectedVoter && !generatedCode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="generate-code-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id="generate-code-title"
              className="text-2xl font-bold text-slate-900"
            >
              Generate Access Code
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              You are about to generate a
              secure voting access code for:
            </p>

            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                {selectedVoter.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedVoter.location}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                <strong>Important:</strong>{" "}
                The access code will be shown
                only once. Copy it and deliver
                it privately to the voter.
              </p>
            </div>

            {generationError && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {generationError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeGenerateCodeModal}
                disabled={isGenerating}
                className="rounded-md border px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleGenerateCode()
                }
                disabled={isGenerating}
                className="rounded-md bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {isGenerating
                  ? "Generating..."
                  : "Confirm & Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ONE-TIME ACCESS-CODE DISPLAY
      ================================================= */}

      {generatedCode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="generated-code-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5">
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Successfully Issued
              </span>

              <h2
                id="generated-code-title"
                className="mt-3 text-2xl font-bold text-slate-900"
              >
                Voter Access Code
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Access code generated for{" "}
                <strong>
                  {generatedCode.voterName}
                </strong>
                .
              </p>
            </div>

            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-800">
                Your Generated Code
              </p>

              <p className="break-all font-mono text-xl font-bold tracking-wider text-slate-900 sm:text-2xl">
                {generatedCode.accessCode}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleCopyCode()
              }
              className="mt-4 w-full rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              {codeCopied
                ? "✓ Copied to Clipboard"
                : "Copy Access Code"}
            </button>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                <strong>
                  Save this code securely.
                </strong>{" "}
                It cannot be retrieved after
                this window is closed.
                Do not share it publicly.
              </p>
            </div>

            <button
              type="button"
              onClick={closeGeneratedCodeModal}
              className="mt-6 w-full rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Done — Close Window
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}