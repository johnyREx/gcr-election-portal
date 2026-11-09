"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import AdminLogoutButton from "@/features/admin/AdminLogoutButton";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  type Election,
  type ElectionReadiness,
  type TurnoutSummary,
  getAnalytics,
  getElection,
  getElectionReadiness,
} from "@/services/electionService";

// =====================================================
// CONFIGURATION
// =====================================================

const OFFICIAL_ELECTION_ID = "ACGC-GENERAL-2026";

type ControlAction =
  | "open"
  | "close"
  | "publish"
  | "hide"
  | "reset";

type ControlStatus = {
  success: boolean;
  electionId: string;
  status: string;
  resultsVisible: boolean;
  openingEnabled: boolean;

  readiness?: {
    ready: boolean;
    issues: string[];
  };

  ballotIntegrity?: {
    valid: boolean;
    issues: string[];
  };

  availableActions: {
    open: boolean;
    close: boolean;
    publish: boolean;
    reset: boolean;
    hide?: boolean;
  };
};

type ResetPreview = {
  success: boolean;
  electionId: string;
  currentStatus: string;
  destructiveActionPerformed: boolean;
  resetEnabled: boolean;

  affectedRecords: {
    voters: number;
    ballots: number;
    votes: number;
    sessions: number;
    accessCodes: number;
  };

  message: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  code?: string;
  issues?: string[];
  [key: string]: unknown;
};

// =====================================================
// STATUS STYLES
// =====================================================

function getStatusClasses(status?: string) {
  switch (status) {
    case "Open":
      return "bg-green-100 text-green-700";

    case "Closed":
      return "bg-red-100 text-red-700";

    case "Results Published":
      return "bg-blue-100 text-blue-700";

    case "Draft":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-amber-100 text-amber-800";
  }
}

// =====================================================
// ADMIN API REQUEST
// =====================================================

async function adminElectionRequest<
  T extends ApiResponse
>(
  action: string,
  additionalData: Record<string, unknown> = {}
): Promise<T> {
  const adminToken =
    sessionStorage.getItem("gcr-admin-token");

  if (!adminToken) {
    throw new Error(
      "Your administrator session has expired. Please sign in again."
    );
  }

  const response = await fetch("/api/election", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    cache: "no-store",

    body: JSON.stringify({
      ...additionalData,
      action,
      electionId: OFFICIAL_ELECTION_ID,
      adminToken,
    }),
  });

  let data: T;

  try {
    data = (await response.json()) as T;
  } catch {
    throw new Error(
      "The election server returned an invalid response."
    );
  }

  if (!response.ok || !data.success) {
    const details = Array.isArray(data.issues)
      ? data.issues.join("; ")
      : "";

    throw new Error(
      [
        data.message || "Election operation failed.",
        details,
      ]
        .filter(Boolean)
        .join(" ")
    );
  }

  return data;
}

// =====================================================
// DASHBOARD
// =====================================================

export default function AdminDashboard() {
  // ===================================================
  // STATE
  // ===================================================

  const [election, setElection] =
    useState<Election | null>(null);

  const [summary, setSummary] =
    useState<TurnoutSummary | null>(null);

  const [readiness, setReadiness] =
    useState<ElectionReadiness | null>(null);

  const [controls, setControls] =
    useState<ControlStatus | null>(null);

  const [resetPreview, setResetPreview] =
    useState<ResetPreview | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [activeAction, setActiveAction] =
    useState<ControlAction | null>(null);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [controlError, setControlError] =
    useState("");

  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  const loadDashboard = useCallback(async () => {
    const results = await Promise.allSettled([
      getElection(),

      getAnalytics(),

      getElectionReadiness(),

      adminElectionRequest<ControlStatus>(
        "getOfficialElectionControlStatus"
      ),
    ]);

    const [
      electionResult,
      analyticsResult,
      readinessResult,
      controlResult,
    ] = results;

    // -----------------------------------------------
    // ELECTION
    // -----------------------------------------------

    if (electionResult.status === "fulfilled") {
      const loadedElection =
        electionResult.value.election || null;

      if (
        loadedElection &&
        loadedElection.id !== OFFICIAL_ELECTION_ID
      ) {
        setElection(null);

        setError(
          "The API returned a different election. Official controls are unavailable."
        );
      } else {
        setElection(loadedElection);
      }
    } else {
      setElection(null);

      setError(
        "Unable to load the official election."
      );
    }

    // -----------------------------------------------
    // ANALYTICS
    // -----------------------------------------------

    if (analyticsResult.status === "fulfilled") {
      setSummary(
        analyticsResult.value.analytics.summary
      );
    } else {
      setSummary(null);
    }

    // -----------------------------------------------
    // READINESS
    // -----------------------------------------------

    if (readinessResult.status === "fulfilled") {
      setReadiness(
        readinessResult.value.readiness
      );
    } else {
      setReadiness(null);
    }

    // -----------------------------------------------
    // OFFICIAL CONTROLS
    // -----------------------------------------------

    if (controlResult.status === "fulfilled") {
      const result = controlResult.value;

      if (
        result.electionId === OFFICIAL_ELECTION_ID
      ) {
        setControls(result);
        setControlError("");
      } else {
        setControls(null);

        setControlError(
          "Election control response did not match the official election."
        );
      }
    } else {
      setControls(null);

      setControlError(
        controlResult.reason instanceof Error
          ? controlResult.reason.message
          : "Unable to load election controls."
      );
    }

    setIsLoading(false);
  }, []);

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // ===================================================
  // REFRESH
  // ===================================================

  async function handleRefresh() {
    if (isRefreshing || activeAction) {
      return;
    }

    setIsRefreshing(true);
    setError("");
    setSuccessMessage("");
    setResetPreview(null);

    try {
      await loadDashboard();
    } finally {
      setIsRefreshing(false);
    }
  }

  // ===================================================
  // DISPLAY ACTION ERROR
  // ===================================================

  function showActionError(message: string) {
    setSuccessMessage("");
    setError(message);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ===================================================
  // EXPLAIN UNAVAILABLE ACTIONS
  // ===================================================

  function getUnavailableReason(
    action: ControlAction
  ): string | null {
    if (!election || !controls) {
      return (
        "Election controls are unavailable. " +
        "Refresh the dashboard and try again."
      );
    }

    if (
      election.id !== OFFICIAL_ELECTION_ID ||
      controls.electionId !== OFFICIAL_ELECTION_ID
    ) {
      return (
        "Election ID mismatch. " +
        "This dashboard only manages the official election."
      );
    }

    if (controls.status !== election.status) {
      return (
        "Election status is out of sync. " +
        "Refresh the dashboard before continuing."
      );
    }

    switch (action) {
      // ---------------------------------------------
      // OPEN
      // ---------------------------------------------

      case "open": {
        if (election.status !== "Draft") {
          return (
            "Only an election in Draft status " +
            "can be opened."
          );
        }

        if (
          !controls.openingEnabled ||
          !controls.availableActions.open
        ) {
          const issues = [
            ...(controls.readiness?.issues || []),
            ...(readiness?.issues || []),
            ...(controls.ballotIntegrity?.issues || []),
          ];

          const uniqueIssues = [...new Set(issues)];

          if (uniqueIssues.length > 0) {
            return (
              "Official election opening is currently blocked:\n\n" +
              uniqueIssues
                .map((issue, index) => {
                  return `${index + 1}. ${issue}`;
                })
                .join("\n")
            );
          }

          return (
            "Official election opening is locked " +
            "until all backend readiness and security " +
            "requirements have been satisfied."
          );
        }

        return null;
      }

      // ---------------------------------------------
      // CLOSE
      // ---------------------------------------------

      case "close": {
        if (election.status === "Draft") {
          return (
            "The election cannot be closed because " +
            "it has not been opened yet."
          );
        }

        if (election.status === "Closed") {
          return "The election is already closed.";
        }

        if (
          election.status === "Results Published"
        ) {
          return (
            "The election has already been closed " +
            "and its results have been published."
          );
        }

        if (
          election.status !== "Open" ||
          !controls.availableActions.close
        ) {
          return (
            "The backend has not authorized " +
            "closing this election."
          );
        }

        return null;
      }

      // ---------------------------------------------
      // PUBLISH
      // ---------------------------------------------

      case "publish": {
        if (election.status === "Draft") {
          return (
            "Results cannot be published while " +
            "the election is still in Draft status."
          );
        }

        if (election.status === "Open") {
          return (
            "Close the election before publishing results."
          );
        }

        if (
          election.status === "Results Published"
        ) {
          return (
            "Election results have already been published."
          );
        }

        if (
          election.status !== "Closed" ||
          !controls.availableActions.publish
        ) {
          return (
            "Results publication is not authorized. " +
            "The backend must confirm that the election " +
            "is closed and all integrity checks have passed."
          );
        }

        return null;
      }

      // ---------------------------------------------
      // HIDE
      // ---------------------------------------------

      case "hide": {
        if (
          election.status !== "Results Published" ||
          !election.resultsVisible
        ) {
          return (
            "There are no publicly visible results " +
            "to hide. Results must first be published."
          );
        }

        if (
          controls.availableActions.hide === false
        ) {
          return (
            "The backend has disabled hiding " +
            "official election results."
          );
        }

        return null;
      }

      // ---------------------------------------------
      // RESET PREVIEW
      // ---------------------------------------------

      case "reset": {
        return null;
      }

      default:
        return "Unknown election action.";
    }
  }

  // ===================================================
  // HANDLE OFFICIAL ACTION
  // ===================================================

  async function handleAction(action: ControlAction) {
    if (activeAction || isRefreshing) {
      return;
    }

    const unavailableReason =
      getUnavailableReason(action);

    if (unavailableReason) {
      showActionError(unavailableReason);
      return;
    }

    let apiAction = "";

    let additionalData: Record<string, unknown> = {};

    // =================================================
    // OPEN ELECTION
    // =================================================

    if (action === "open") {
      const confirmed = window.confirm(
        "OPEN OFFICIAL ELECTION?\n\n" +
          "Election: ACGC-GENERAL-2026\n\n" +
          "This will allow eligible voters to " +
          "submit official ballots.\n\n" +
          "Continue?"
      );

      if (!confirmed) {
        return;
      }

      apiAction = "openOfficialElection";
    }

    // =================================================
    // CLOSE ELECTION
    // =================================================

    if (action === "close") {
      const confirmed = window.confirm(
        "CLOSE OFFICIAL ELECTION?\n\n" +
          "Election: ACGC-GENERAL-2026\n\n" +
          "Voters will no longer be able to " +
          "submit ballots.\n\n" +
          "This action cannot be reversed " +
          "through the dashboard.\n\n" +
          "Continue?"
      );

      if (!confirmed) {
        return;
      }

      apiAction = "closeOfficialElection";
    }

    // =================================================
    // PUBLISH RESULTS
    // =================================================

    if (action === "publish") {
      const certification = window.prompt(
        "OFFICIAL RESULTS CERTIFICATION\n\n" +
          "Confirm that the results have been " +
          "independently reviewed and approved.\n\n" +
          "Type exactly:\n\n" +
          "CERTIFY OFFICIAL RESULTS"
      );

      if (
        certification !== "CERTIFY OFFICIAL RESULTS"
      ) {
        if (certification !== null) {
          showActionError(
            "Results certification was not confirmed."
          );
        }

        return;
      }

      apiAction = "publishOfficialElectionResults";

      additionalData = {
        certification,
      };
    }

    // =================================================
    // HIDE RESULTS
    // =================================================

    if (action === "hide") {
      const confirmation = window.prompt(
        "HIDE OFFICIAL RESULTS\n\n" +
          "This will remove published election " +
          "results from public view.\n\n" +
          "Type exactly:\n\n" +
          "HIDE OFFICIAL RESULTS"
      );

      if (
        confirmation !== "HIDE OFFICIAL RESULTS"
      ) {
        if (confirmation !== null) {
          showActionError(
            "Results visibility change was not confirmed."
          );
        }

        return;
      }

      apiAction = "hideOfficialElectionResults";

      additionalData = {
        confirmation,
      };
    }

    // =================================================
    // RESET PREVIEW
    // =================================================

    if (action === "reset") {
      apiAction = "previewOfficialElectionReset";
    }

    if (!apiAction) {
      showActionError(
        "The requested election action is unavailable."
      );

      return;
    }

    // =================================================
    // EXECUTE REQUEST
    // =================================================

    try {
      setActiveAction(action);
      setError("");
      setSuccessMessage("");

      // ---------------------------------------------
      // RESET PREVIEW ONLY
      // ---------------------------------------------

      if (action === "reset") {
        const preview =
          await adminElectionRequest<ResetPreview>(
            apiAction
          );

        if (
          preview.electionId !== OFFICIAL_ELECTION_ID
        ) {
          throw new Error(
            "Reset preview returned an unexpected election ID."
          );
        }

        if (
          preview.destructiveActionPerformed !== false
        ) {
          throw new Error(
            "Reset preview did not confirm that it was read-only."
          );
        }

        setResetPreview(preview);

        setSuccessMessage(
          "Official election reset preview loaded. No records were changed."
        );

        return;
      }

      // ---------------------------------------------
      // OFFICIAL ELECTION OPERATION
      // ---------------------------------------------

      const response =
        await adminElectionRequest<ApiResponse>(
          apiAction,
          additionalData
        );

      setSuccessMessage(
        response.message ||
          "Official election operation completed successfully."
      );

      setResetPreview(null);

      await loadDashboard();
    } catch (caughtError) {
      showActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to complete election operation."
      );
    } finally {
      setActiveAction(null);
    }
  }

  // ===================================================
  // LOADING
  // ===================================================

  if (isLoading) {
    return (
      <Section>
        <Container>
          <p className="text-center text-slate-600">
            Loading official election administration...
          </p>
        </Container>
      </Section>
    );
  }

  // ===================================================
  // COMPUTED VALUES
  // ===================================================

  const isDraft = election?.status === "Draft";

  const resultsVisible = Boolean(
    election?.resultsVisible
  );

  const registeredVoters =
    readiness?.registeredVoters ?? 0;

  const registeredCandidates =
    readiness?.registeredCandidates ?? 0;

  const accessCodesIssued =
    readiness?.accessCodesIssued ?? 0;

  const accessCodesRequired =
    readiness?.accessCodesRequired ?? 0;

  const accessCodeProgress =
    accessCodesRequired > 0
      ? Math.min(
          100,
          (accessCodesIssued / accessCodesRequired) * 100
        )
      : 0;

  const controlsAvailable = Boolean(
    election &&
      controls &&
      election.id === OFFICIAL_ELECTION_ID &&
      controls.electionId === OFFICIAL_ELECTION_ID &&
      controls.status === election.status
  );

  const isBusy =
    activeAction !== null || isRefreshing;

  const canOpen =
    controlsAvailable &&
    election?.status === "Draft" &&
    controls?.openingEnabled === true &&
    controls?.availableActions.open === true;

  const canClose =
    controlsAvailable &&
    election?.status === "Open" &&
    controls?.availableActions.close === true;

  const canPublish =
    controlsAvailable &&
    election?.status === "Closed" &&
    controls?.availableActions.publish === true;

  const canHide =
    controlsAvailable &&
    election?.status === "Results Published" &&
    resultsVisible &&
    controls?.availableActions.hide !== false;

  // Buttons stay interactive when an action is blocked.
  // The handler explains why the operation is unavailable.
  // Backend authorization remains mandatory.

  const actionButtonClass =
    "rounded-md px-5 py-3 font-semibold transition " +
    "hover:brightness-95 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <Section className="bg-slate-50">
      <Container>

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              Election Administration
            </p>

            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Election Control Center
            </h1>

            <p className="mt-3 text-slate-600">
              Manage official election readiness,
              turnout, results, and administration.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isBusy}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <AdminLogoutButton />
          </div>
        </div>

        {/* ========================================= */}
        {/* ERROR MESSAGE */}
        {/* ========================================= */}

        {error && (
          <div
            role="alert"
            className="mb-8 whitespace-pre-line rounded-md border border-red-200 bg-red-50 px-5 py-4 text-red-700"
          >
            <p className="font-semibold">
              Election Operation
            </p>

            <p className="mt-2 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* ========================================= */}
        {/* SUCCESS MESSAGE */}
        {/* ========================================= */}

        {successMessage && (
          <div
            role="status"
            className="mb-8 rounded-md border border-green-200 bg-green-50 px-5 py-4 text-green-700"
          >
            {successMessage}
          </div>
        )}

        {/* ========================================= */}
        {/* CONTROL ERROR */}
        {/* ========================================= */}

        {controlError && (
          <div className="mb-8 rounded-md border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
            <p className="font-semibold">
              Election Controls Unavailable
            </p>

            <p className="mt-2 text-sm">
              {controlError}
            </p>
          </div>
        )}

        {/* ========================================= */}
        {/* OFFICIAL ELECTION STATUS */}
        {/* ========================================= */}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Official Election Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* ELECTION DETAILS */}

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {election?.title ||
                    "Election unavailable"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Election ID:{" "}
                  {election?.id || "Unavailable"}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                      election?.status
                    )}`}
                  >
                    {election?.status || "Unknown"}
                  </span>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      resultsVisible
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    Results:{" "}
                    {resultsVisible
                      ? "Visible"
                      : "Hidden"}
                  </span>
                </div>
              </div>

              {/* ELECTION CONTROL BUTTONS */}

              <div className="grid gap-3 sm:grid-cols-2">

                {/* OPEN ELECTION */}

                <button
                  type="button"
                  onClick={() =>
                    void handleAction("open")
                  }
                  disabled={isBusy}
                  aria-disabled={!canOpen}
                  title={
                    canOpen
                      ? "Open official election"
                      : "Click to see why opening is unavailable"
                  }
                  className={`${actionButtonClass} bg-green-700 text-white hover:bg-green-800`}
                >
                  {activeAction === "open"
                    ? "Opening..."
                    : "Open Election"}
                </button>

                {/* CLOSE ELECTION */}

                <button
                  type="button"
                  onClick={() =>
                    void handleAction("close")
                  }
                  disabled={isBusy}
                  aria-disabled={!canClose}
                  title={
                    canClose
                      ? "Close official election"
                      : "Click to see why closing is unavailable"
                  }
                  className={`${actionButtonClass} bg-slate-800 text-white hover:bg-slate-900`}
                >
                  {activeAction === "close"
                    ? "Closing..."
                    : "Close Election"}
                </button>

                {/* PUBLISH RESULTS */}

                <button
                  type="button"
                  onClick={() =>
                    void handleAction("publish")
                  }
                  disabled={isBusy}
                  aria-disabled={!canPublish}
                  title={
                    canPublish
                      ? "Publish official results"
                      : "Click to see why publication is unavailable"
                  }
                  className={`${actionButtonClass} bg-blue-700 text-white hover:bg-blue-800`}
                >
                  {activeAction === "publish"
                    ? "Publishing..."
                    : "Publish Results"}
                </button>

                {/* HIDE RESULTS */}

                <button
                  type="button"
                  onClick={() =>
                    void handleAction("hide")
                  }
                  disabled={isBusy}
                  aria-disabled={!canHide}
                  title={
                    canHide
                      ? "Hide published results"
                      : "Click to see why hiding is unavailable"
                  }
                  className={`${actionButtonClass} border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
                >
                  {activeAction === "hide"
                    ? "Hiding..."
                    : "Hide Results"}
                </button>
              </div>
            </div>

            {/* CONTROL STATUS */}

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">
                  Control Status:
                </span>{" "}
                {controlsAvailable
                  ? "Connected to official election controls."
                  : "Official election controls require verification."}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Select an election action to view its
                availability or proceed when authorized.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* ELECTION READINESS */}
        {/* ========================================= */}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Election Readiness
            </CardTitle>
          </CardHeader>

          <CardContent>
            {!readiness ? (
              <p className="text-slate-500">
                Readiness information is unavailable.
              </p>
            ) : (
              <>
                {/* READINESS STATUS */}

                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      readiness.ready
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {readiness.ready
                      ? "Ready to Open"
                      : "Not Ready"}
                  </span>

                  {!readiness.openingEnabled && (
                    <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                      Security Lock Active
                    </span>
                  )}
                </div>

                {/* READINESS METRICS */}

                <div className="grid gap-4 sm:grid-cols-3">

                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      Registered Voters
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {registeredVoters}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      Candidates
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {registeredCandidates}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      Access Codes
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {accessCodesIssued}

                      <span className="text-lg text-slate-400">
                        /{accessCodesRequired}
                      </span>
                    </p>
                  </div>
                </div>

                {/* ACCESS CODE PROGRESS */}

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Access-code distribution
                    </span>

                    <span className="text-slate-500">
                      {Math.round(accessCodeProgress)}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all"
                      style={{
                        width: `${accessCodeProgress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* OUTSTANDING REQUIREMENTS */}

                {readiness.issues.length > 0 && (
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <h3 className="font-semibold text-amber-900">
                      Outstanding Requirements
                    </h3>

                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-900">
                      {readiness.issues.map(
                        (issue, index) => (
                          <li
                            key={`${issue}-${index}`}
                          >
                            {issue}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* VOTER MANAGEMENT */}

                {isDraft && (
                  <div className="mt-6">
                    <Link
                      href="/admin/voters"
                      className="inline-flex rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
                    >
                      Manage Voter Access Codes →
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* BALLOT INTEGRITY */}
        {/* ========================================= */}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Ballot Integrity
            </CardTitle>
          </CardHeader>

          <CardContent>
            {!controls ? (
              <p className="text-sm text-slate-500">
                Integrity report unavailable.
              </p>
            ) : (
              <>
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                    controls.ballotIntegrity?.valid
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {controls.ballotIntegrity?.valid
                    ? "Integrity Check Passed"
                    : "Integrity Check Failed"}
                </span>

                {controls.ballotIntegrity?.issues
                  ?.length ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-red-700">
                    {controls.ballotIntegrity.issues.map(
                      (issue, index) => (
                        <li
                          key={`${issue}-${index}`}
                        >
                          {issue}
                        </li>
                      )
                    )}
                  </ul>
                ) : null}

                <p className="mt-4 text-sm text-slate-500">
                  Ballot integrity is checked by the
                  election backend before results
                  publication.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* TURNOUT STATISTICS */}
        {/* ========================================= */}

        {summary && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Registered Voters",
                value: summary.registeredVoters,
              },
              {
                label: "Votes Cast",
                value: summary.votesCast,
              },
              {
                label: "Remaining Voters",
                value: summary.remainingVoters,
              },
              {
                label: "Turnout",
                value: `${summary.turnoutPercentage}%`,
              },
            ].map((item) => (
              <Card key={item.label}>
                <CardHeader>
                  <CardTitle className="text-base text-slate-600">
                    {item.label}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-4xl font-bold text-slate-900">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ========================================= */}
        {/* OFFICIAL RESET PREVIEW */}
        {/* ========================================= */}

        <Card className="mb-8 border-amber-200">
          <CardHeader>
            <CardTitle>
              Official Election Reset
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="mb-5 text-sm text-slate-600">
              Inspect the records that would be
              affected by resetting the official
              election. This operation is read-only.
            </p>

            <button
              type="button"
              onClick={() =>
                void handleAction("reset")
              }
              disabled={isBusy}
              className={`${actionButtonClass} border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
            >
              {activeAction === "reset"
                ? "Loading Preview..."
                : "Preview Election Reset"}
            </button>

            {resetPreview && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="font-semibold text-amber-900">
                  Reset Impact Preview
                </h3>

                <p className="mt-2 text-sm text-amber-900">
                  Election:{" "}
                  {resetPreview.electionId}
                </p>

                <p className="mt-1 text-sm text-amber-900">
                  Current Status:{" "}
                  {resetPreview.currentStatus}
                </p>

                {/* RESET RECORD COUNTS */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      label: "Voter Records",
                      value:
                        resetPreview.affectedRecords
                          .voters,
                    },
                    {
                      label: "Ballots",
                      value:
                        resetPreview.affectedRecords
                          .ballots,
                    },
                    {
                      label: "Vote Records",
                      value:
                        resetPreview.affectedRecords
                          .votes,
                    },
                    {
                      label: "Voting Sessions",
                      value:
                        resetPreview.affectedRecords
                          .sessions,
                    },
                    {
                      label: "Access Codes",
                      value:
                        resetPreview.affectedRecords
                          .accessCodes,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg bg-white p-4"
                    >
                      <p className="text-sm text-slate-500">
                        {item.label}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* RESET SAFETY */}

                <div className="mt-5 rounded-lg border border-amber-300 bg-white p-4">
                  <p className="font-semibold text-amber-900">
                    Reset Execution Locked
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {resetPreview.message}
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="mt-5 cursor-not-allowed rounded-md bg-red-700 px-5 py-3 font-semibold text-white opacity-40"
                >
                  Execute Official Reset — Disabled
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* ELECTION OPERATIONS */}
        {/* ========================================= */}

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">

          <Card>
            <CardHeader>
              <CardTitle>
                Election Operations
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  href: "/admin/voters",
                  title: "Manage Voters",
                  description:
                    "Manage registered voters and access codes.",
                },
                {
                  href: "/admin/candidates",
                  title: "Manage Candidates",
                  description:
                    "Manage candidates, positions and running mates.",
                },
                {
                  href: "/admin/results",
                  title: "Preview Results",
                  description:
                    "View administrative election results.",
                },
                {
                  href: "/results",
                  title: "Public Results",
                  description:
                    "Preview the public results page.",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border p-5 transition hover:border-green-300 hover:bg-green-50"
                >
                  <p className="font-semibold text-slate-900">
                    {item.title}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.description}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* ===================================== */}
          {/* SYSTEM SECURITY */}
          {/* ===================================== */}

          <Card>
            <CardHeader>
              <CardTitle>
                System Security
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-slate-600">
                Official election controls are
                protected by administrator
                authentication, election status
                validation, and backend security
                checks.
              </p>

              <div
                className={`mt-5 rounded-lg p-4 text-sm font-medium ${
                  controls?.openingEnabled
                    ? "bg-green-50 text-green-800"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                {controls?.openingEnabled
                  ? "Opening security gate enabled."
                  : "Election opening security lock active."}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Official election:{" "}
                {OFFICIAL_ELECTION_ID}
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}