import {
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { checkMultipleRateLimits } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// CONFIGURATION
// =====================================================

const apiUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

const OFFICIAL_ELECTION_ID = "ACGC-GENERAL-2026";

const OFFICIAL_VOTER_COUNT = 76;
const BULK_BATCH_SIZE = 10;

const MAX_REQUEST_BYTES = 16_384;

const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const ACCESS_CODE_PATTERN =
  /^[A-Z]{6}(?:-[A-Z0-9]{4}){3}$/;

// =====================================================
// API TYPES
// =====================================================

type ApiResult = {
  success: boolean;
  message?: string;
  code?: string;
  [key: string]: unknown;
};

type ElectionApiRequest = Record<string, unknown> & {
  action?: string;
};

type Voter = {
  id: string | number;
  name: string;
};

type CodeStatus = {
  voterId: string;
  status: string;
};

type BallotDecision =
  | "YES"
  | "NO"
  | "ABSTAIN"
  | "SELECT";

type BallotSelection = {
  position: string;
  candidateId: string;
  decision: BallotDecision;
};

// =====================================================
// ACTION ALLOWLIST
// =====================================================

const PUBLIC_ACTIONS = new Set([
  "getElection",
  "getCandidates",
  "getResults",
]);

const AUTH_ACTIONS = new Set([
  "loginAdmin",
  "verifyAdminSession",
  "logoutAdmin",
]);

const ADMIN_READ_ACTIONS = new Set([
  "getVoters",
  "getVoterAccessCodeStatuses",
  "verifyOfficialAccessCodeIntegrity",
  "getAdminCandidates",
  "getAnalytics",
  "getPollingDashboard",
  "getAdminResults",
  "getElectionReadiness",
  "getElections",
]);

const ADMIN_WRITE_ACTIONS = new Set([
  "addVoter",
  "updateVoter",
  "importVoters",
  "addCandidate",
  "updateCandidate",
  "deleteCandidate",
  "generateVoterAccessCode",
  "generateBulkVoterAccessCodes",
]);

const ELECTION_CONTROL_ACTIONS = new Set([
  "getOfficialElectionControlStatus",
  "openOfficialElection",
  "closeOfficialElection",
  "previewOfficialElectionReset",
  "publishOfficialElectionResults",
  "hideOfficialElectionResults",
]);

const SIGNED_VOTING_ACTIONS = new Set([
  "createVotingSession",
  "submitBallot",
]);


const DISABLED_ACTIONS = new Set([
  "searchVoters",
  "verifyVoter",
  "verifyVoterAccessCode",
  "submitVote",
  "issueVoterAccessCode",
  "openElection",
  "closeElection",
  "publishElectionResults",
  "hideElectionResults",
  "updateElectionStatus",
  "resetElection",
  "signedPayload",
  "serverAuth",
  "testServerConnection",
]);

const ALLOWED_ACTIONS = new Set([
  ...PUBLIC_ACTIONS,
  ...AUTH_ACTIONS,
  ...ADMIN_READ_ACTIONS,
  ...ADMIN_WRITE_ACTIONS,
  ...ELECTION_CONTROL_ACTIONS,
  ...SIGNED_VOTING_ACTIONS,
]);

// =====================================================
// STANDARD JSON RESPONSE
// =====================================================

function jsonResponse(
  data: ApiResult,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// =====================================================
// ENVIRONMENT SAFETY
// =====================================================

function isLocalDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ELECTION_DEPLOYMENT_MODE ===
      "development"
  );
}

function getTrustedClientIdentifier(
  request: NextRequest
): string | null {
  // Local development only.
  if (isLocalDevelopment()) {
    return "local-development-client";
  }

  // Only enable production identification on Vercel.
  if (
    process.env.VERCEL !== "1" ||
    process.env.ELECTION_DEPLOYMENT_MODE !== "production"
  ) {
    return null;
  }

  /*
   * Vercel provides the client IP through
   * its proxy infrastructure.
   *
   * This relies on Vercel's trusted proxy
   * configuration and must be verified
   * before enabling official voting.
   */
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (!forwardedFor) {
    return null;
  }

  const clientIp = forwardedFor
    .split(",")[0]
    .trim();

  if (!clientIp) {
    return null;
  }

  return `vercel:${clientIp}`;
}

// =====================================================
// RATE LIMIT ERROR
// =====================================================

function rateLimitError(
  reason?: string,
  retryAfterSeconds?: number
) {
  if (reason === "RATE_LIMITED") {
    const retryAfter = Math.max(
      1,
      retryAfterSeconds || 60
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Too many attempts. Please wait before trying again.",
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return jsonResponse(
    {
      success: false,
      message:
        "Verification is temporarily unavailable. Please try again later.",
      code: "RATE_LIMIT_UNAVAILABLE",
    },
    503
  );
}

// =====================================================
// ELECTION VALIDATION
// =====================================================

function isOfficialElection(
  electionId: unknown
): boolean {
  return (
    typeof electionId === "string" &&
    electionId.trim() === OFFICIAL_ELECTION_ID
  );
}

function electionAccessError() {
  return jsonResponse(
    {
      success: false,
      message: "This election is not available.",
      code: "ELECTION_NOT_ALLOWED",
    },
    403
  );
}

// =====================================================
// SECURE RANDOM CHARACTERS
// =====================================================

function secureRandomCharacters(
  length: number
): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const alphabetLength = alphabet.length;

  const limit =
    Math.floor(256 / alphabetLength) *
    alphabetLength;

  let result = "";

  while (result.length < length) {
    const bytes = randomBytes(length);

    for (const byte of bytes) {
      if (byte >= limit) {
        continue;
      }

      result += alphabet[byte % alphabetLength];

      if (result.length === length) {
        break;
      }
    }
  }

  return result;
}

// =====================================================
// ACCESS CODE PREFIX
// =====================================================

function buildPrefix(name: string): string {
  const parts = name
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length < 2) {
    throw new Error(
      "First and last names are required."
    );
  }

  const first = parts[0]
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");

  const last = parts[parts.length - 1]
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");

  return first + last;
}

// =====================================================
// GENERATE ACCESS CODE
// =====================================================

function generateAccessCode(
  voterName: string
): string {
  return [
    buildPrefix(voterName),
    secureRandomCharacters(4),
    secureRandomCharacters(4),
    secureRandomCharacters(4),
  ].join("-");
}

// =====================================================
// SIGNED SERVER REQUEST
// =====================================================

function createSignedServerRequest(
  payload: Record<string, unknown>
) {
  const secret =
    process.env.ELECTION_SERVER_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ELECTION_SERVER_SECRET is not configured."
    );
  }

  const action = String(
    payload.action || ""
  ).trim();

  if (!action) {
    throw new Error(
      "Cannot sign a request without an action."
    );
  }

  const timestamp = Date.now();

  const nonce = randomBytes(24)
    .toString("base64url");

  const payloadJson = JSON.stringify(payload);

  const payloadHash = createHash("sha256")
    .update(payloadJson, "utf8")
    .digest("base64url");

  const message = [
    "ACGC-SERVER-V1",
    String(timestamp),
    nonce,
    action,
    payloadHash,
  ].join("\n");

  const signature = createHmac(
    "sha256",
    secret
  )
    .update(message, "utf8")
    .digest("base64url");

  return {
    payloadJson,
    serverAuth: {
      timestamp,
      nonce,
      action,
      payloadHash,
      signature,
    },
  };
}

// =====================================================
// APPS SCRIPT CLIENT
// =====================================================

async function callAppsScript(
  body: Record<string, unknown>
): Promise<ApiResult> {
  if (!apiUrl) {
    throw new Error("API_NOT_CONFIGURED");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type":
        "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body),
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "APPS_SCRIPT_REQUEST_FAILED"
    );
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !("success" in data)
  ) {
    throw new Error(
      "INVALID_API_RESPONSE"
    );
  }

  return data as ApiResult;
}

// =====================================================
// SIGNED APPS SCRIPT CLIENT
// =====================================================

async function callSignedAppsScript(
  payload: Record<string, unknown>
): Promise<ApiResult> {
  if (!apiUrl) {
    throw new Error("API_NOT_CONFIGURED");
  }

  const signed =
    createSignedServerRequest(payload);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type":
        "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      signedPayload: signed.payloadJson,
      serverAuth: signed.serverAuth,
    }),
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "SIGNED_REQUEST_FAILED"
    );
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !("success" in data)
  ) {
    throw new Error(
      "INVALID_API_RESPONSE"
    );
  }

  return data as ApiResult;
}

// =====================================================
// BALLOT VALIDATION
// =====================================================

function validateBallotSelections(
  value: unknown
): BallotSelection[] | null {
  if (
    !Array.isArray(value) ||
    value.length !== 6
  ) {
    return null;
  }

  const selections: BallotSelection[] = [];
  const positions = new Set<string>();

  const validDecisions =
    new Set<BallotDecision>([
      "YES",
      "NO",
      "ABSTAIN",
      "SELECT",
    ]);

  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      return null;
    }

    const selection =
      item as Record<string, unknown>;

    if (
      typeof selection.position !== "string" ||
      typeof selection.candidateId !== "string" ||
      typeof selection.decision !== "string"
    ) {
      return null;
    }

    const position =
      selection.position.trim();

    const candidateId =
      selection.candidateId.trim();

    const decision =
      selection.decision
        .trim()
        .toUpperCase() as BallotDecision;

    if (
      !position ||
      position.length > 100 ||
      candidateId.length > 150 ||
      !validDecisions.has(decision)
    ) {
      return null;
    }

    if (
      decision !== "ABSTAIN" &&
      !candidateId
    ) {
      return null;
    }

    if (positions.has(position)) {
      return null;
    }

    positions.add(position);

    selections.push({
      position,
      candidateId,
      decision,
    });
  }

  return selections;
}

// =====================================================
// ADMIN TOKEN VALIDATION
// =====================================================

function hasAdminToken(
  body: ElectionApiRequest
): boolean {
  return (
    typeof body.adminToken === "string" &&
    body.adminToken.trim().length > 0
  );
}

// =====================================================
// OFFICIAL BULK ACCESS-CODE GENERATION
// =====================================================

async function generateOfficialBulkBatch(
  electionId: string,
  adminToken: string
): Promise<NextResponse> {
  if (!isOfficialElection(electionId)) {
    return electionAccessError();
  }

  // ============================================
  // VERIFY ADMIN AND FETCH VOTERS
  // ============================================

  const votersResponse = await callAppsScript({
    action: "getVoters",
    electionId,
    adminToken,
  });

  if (
    !votersResponse.success ||
    !Array.isArray(votersResponse.voters)
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Administrator authorization failed or voter register unavailable.",
        code: "VOTER_FETCH_FAILED",
      },
      403
    );
  }

  const voters = votersResponse.voters as Voter[];

  if (voters.length !== OFFICIAL_VOTER_COUNT) {
    return jsonResponse(
      {
        success: false,
        message:
          `Expected ${OFFICIAL_VOTER_COUNT} official voters, found ${voters.length}.`,
        code: "VOTER_COUNT_MISMATCH",
      },
      409
    );
  }

  // ============================================
  // VALIDATE VOTER REGISTER
  // ============================================

  const voterIds = new Set<string>();

  for (const voter of voters) {
    const voterId = String(
      voter.id ?? ""
    ).trim();

    if (
      !voterId ||
      typeof voter.name !== "string" ||
      !voter.name.trim() ||
      voterIds.has(voterId)
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "The official voter register contains invalid or duplicate records.",
          code: "INVALID_VOTER_REGISTER",
        },
        409
      );
    }

    voterIds.add(voterId);
  }

  // ============================================
  // VERIFY CREDENTIAL INTEGRITY
  // ============================================

  const integrityResponse = await callAppsScript({
    action: "verifyOfficialAccessCodeIntegrity",
    electionId,
    adminToken,
  });

  if (
    !integrityResponse.success ||
    integrityResponse.valid !== true
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Credential integrity verification failed. No codes were generated.",
        code: "CREDENTIAL_INTEGRITY_FAILED",
      },
      409
    );
  }

  // ============================================
  // FETCH EXISTING CODE STATUSES
  // ============================================

  const statusesResponse = await callAppsScript({
    action: "getVoterAccessCodeStatuses",
    electionId,
    adminToken,
  });

  if (
    !statusesResponse.success ||
    !Array.isArray(statusesResponse.codes)
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Unable to retrieve existing credential statuses.",
        code: "CODE_STATUS_FAILED",
      },
      503
    );
  }

  const existingCodes =
    statusesResponse.codes as CodeStatus[];

  const activeCounts =
    new Map<string, number>();

  for (const record of existingCodes) {
    const voterId = String(
      record.voterId ?? ""
    ).trim();

    if (!voterIds.has(voterId)) {
      return jsonResponse(
        {
          success: false,
          message:
            "Credential records reference an unknown voter.",
          code: "UNKNOWN_CREDENTIAL_VOTER",
        },
        409
      );
    }

    if (
      String(record.status).trim() ===
      "ACTIVE"
    ) {
      activeCounts.set(
        voterId,
        (activeCounts.get(voterId) || 0) + 1
      );
    }
  }

  // ============================================
  // REJECT DUPLICATE ACTIVE CODES
  // ============================================

  for (const count of activeCounts.values()) {
    if (count !== 1) {
      return jsonResponse(
        {
          success: false,
          message:
            "Duplicate active credentials detected.",
          code: "DUPLICATE_ACTIVE_CODES",
        },
        409
      );
    }
  }

  // ============================================
  // IDENTIFY PENDING VOTERS
  // ============================================

  const pendingVoters = voters.filter(
    (voter) =>
      !activeCounts.has(
        String(voter.id).trim()
      )
  );

  if (pendingVoters.length === 0) {
    return jsonResponse({
      success: true,
      message:
        "All official voters already have active access codes.",
      electionId,
      generated: 0,
      remaining: 0,
      completed: true,
      totalVoters: voters.length,
    });
  }

  // ============================================
  // PREPARE ONE BATCH
  // ============================================

  const batch =
    pendingVoters.slice(0, BULK_BATCH_SIZE);

  let codes: {
    voterId: string;
    accessCode: string;
  }[];

  try {
    codes = batch.map((voter) => ({
      voterId: String(voter.id).trim(),
      accessCode: generateAccessCode(voter.name),
    }));
  } catch  (error) {
    return jsonResponse(
      {
        success: false,
        message:
          "Unable to generate credentials for this batch.",
        code: "GENERATION_FAILED",
      },
      400
    );
  }

  // ============================================
  // REGISTER BATCH
  // ============================================

  const result = await callAppsScript({
    action: "generateBulkVoterAccessCodes",
    electionId,
    adminToken,
    codes,
  });

  if (!result.success) {
    return jsonResponse(
      {
        success: false,
        message:
          "Bulk registration failed. Verify credential integrity before retrying.",
        code: "BULK_REGISTRATION_FAILED",
      },
      409
    );
  }

  // ============================================
  // VERIFY AFTER REGISTRATION
  // ============================================

  const finalIntegrity = await callAppsScript({
    action: "verifyOfficialAccessCodeIntegrity",
    electionId,
    adminToken,
  });

  if (
    !finalIntegrity.success ||
    finalIntegrity.valid !== true
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Post-registration integrity verification failed. Stop issuance and investigate.",
        code: "POST_REGISTRATION_INTEGRITY_FAILED",
      },
      409
    );
  }

  // ============================================
  // VERIFY FINAL ACTIVE CODE COUNTS
  // ============================================

  const finalStatuses = await callAppsScript({
    action: "getVoterAccessCodeStatuses",
    electionId,
    adminToken,
  });

  if (
    !finalStatuses.success ||
    !Array.isArray(finalStatuses.codes)
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Unable to verify final credential statuses.",
        code: "FINAL_STATUS_FAILED",
      },
      503
    );
  }

  const finalActiveCounts =
    new Map<string, number>();

  for (const record of
    finalStatuses.codes as CodeStatus[]) {
    if (
      String(record.status).trim() !==
      "ACTIVE"
    ) {
      continue;
    }

    const voterId = String(
      record.voterId ?? ""
    ).trim();

    if (!voterIds.has(voterId)) {
      return jsonResponse(
        {
          success: false,
          message:
            "Unknown voter detected during final verification.",
          code: "FINAL_INTEGRITY_FAILED",
        },
        409
      );
    }

    finalActiveCounts.set(
      voterId,
      (finalActiveCounts.get(voterId) || 0) + 1
    );
  }

  if (
    [...finalActiveCounts.values()].some(
      (count) => count !== 1
    )
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Duplicate active credentials detected after registration.",
        code: "FINAL_INTEGRITY_FAILED",
      },
      409
    );
  }

  const remaining =
    voters.length - finalActiveCounts.size;

  const generated = Number(result.generated);

  if (
    !Number.isInteger(generated) ||
    generated !== batch.length ||
    finalActiveCounts.size !==
      activeCounts.size + batch.length
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "Unexpected credential count after registration. Stop and investigate.",
        code: "CREDENTIAL_COUNT_MISMATCH",
      },
      409
    );
  }

  // ============================================
  // SUCCESS
  // ============================================

  return jsonResponse({
    success: true,
    message:
      remaining === 0
        ? "All official voter access codes have been registered."
        : "Access-code batch registered successfully.",
    electionId,
    totalVoters: voters.length,
    generated,
    activeCodes: finalActiveCounts.size,
    remaining,
    completed: remaining === 0,
    codes,
  });
}

// =====================================================
// MAIN API ROUTE
// =====================================================

export async function POST(
  request: NextRequest
) {
  if (!apiUrl) {
    return jsonResponse(
      {
        success: false,
        message:
          "Election API URL is not configured.",
        code: "API_NOT_CONFIGURED",
      },
      500
    );
  }

  try {
    // ============================================
    // REQUEST SIZE LIMIT
    // ============================================

    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > MAX_REQUEST_BYTES) {
      return jsonResponse(
        {
          success: false,
          message: "Request body is too large.",
          code: "REQUEST_TOO_LARGE",
        },
        413
      );
    }

    const rawBody = await request.text();

    if (
      Buffer.byteLength(rawBody, "utf8") >
      MAX_REQUEST_BYTES
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Request body is too large.",
          code: "REQUEST_TOO_LARGE",
        },
        413
      );
    }

    let body: ElectionApiRequest;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonResponse(
        {
          success: false,
          message: "Invalid JSON request.",
          code: "INVALID_JSON",
        },
        400
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid request body.",
          code: "INVALID_REQUEST",
        },
        400
      );
    }

    const action =
      typeof body.action === "string"
        ? body.action.trim()
        : "";

    if (!action) {
      return jsonResponse(
        {
          success: false,
          message: "An API action is required.",
          code: "INVALID_ACTION",
        },
        400
      );
    }

    // ============================================
    // REJECT SIGNED REQUEST INJECTION
    // ============================================

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "signedPayload"
      ) ||
      Object.prototype.hasOwnProperty.call(
        body,
        "serverAuth"
      )
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Direct signed requests are not permitted.",
          code: "SIGNED_REQUEST_FORBIDDEN",
        },
        403
      );
    }

    // ============================================
    // DISABLED ACTIONS
    // ============================================

    if (DISABLED_ACTIONS.has(action)) {
      return jsonResponse(
        {
          success: false,
          message: "This API action is disabled.",
          code: "ACTION_DISABLED",
        },
        403
      );
    }

    // ============================================
    // EXPLICIT ALLOWLIST
    // ============================================

    if (!ALLOWED_ACTIONS.has(action)) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid API action.",
          code: "INVALID_ACTION",
        },
        400
      );
    }


    // ============================================
    // ADMIN LOGIN
    // ============================================

    if (action === "loginAdmin") {
      const username =
        typeof body.username === "string"
          ? body.username.trim()
          : "";

      const password =
        typeof body.password === "string"
          ? body.password
          : "";

      if (!username || !password) {
        return jsonResponse(
          {
            success: false,
            message:
              "Username and password are required.",
            code: "MISSING_CREDENTIALS",
          },
          400
        );
      }

      const clientId =
        getTrustedClientIdentifier(request);

      if (!clientId) {
        return rateLimitError(
          "RATE_LIMIT_UNAVAILABLE"
        );
      }

      const limits =
        await checkMultipleRateLimits([
          {
            type: "admin-client",
            identifier: clientId,
          },
          {
            type: "admin-credential",
            identifier: username.toLowerCase(),
          },
        ]);

      if (!limits.allowed) {
        return rateLimitError(
          limits.reason,
          limits.retryAfterSeconds
        );
      }

      const result = await callAppsScript({
        action: "loginAdmin",
        username,
        password,
      });

      return jsonResponse(
        result,
        result.success ? 200 : 401
      );
    }

    // ============================================
    // ADMIN SESSION ACTIONS
    // ============================================

    if (
      action === "verifyAdminSession" ||
      action === "logoutAdmin"
    ) {
      if (!hasAdminToken(body)) {
        return jsonResponse(
          {
            success: false,
            message:
              "Administrator session is required.",
            code: "MISSING_ADMIN_SESSION",
          },
          401
        );
      }

      const result = await callAppsScript({
        action,
        adminToken: body.adminToken,
      });

      return jsonResponse(result);
    }

    // ============================================
    // OFFICIAL VOTING SESSION
    // ============================================

    if (action === "createVotingSession") {
      if (!isOfficialElection(body.electionId)) {
        return electionAccessError();
      }

      const accessCode =
        typeof body.accessCode === "string"
          ? body.accessCode
              .trim()
              .toUpperCase()
          : "";

      if (!ACCESS_CODE_PATTERN.test(accessCode)) {
        return jsonResponse(
          {
            success: false,
            message:
              "Enter a valid voter access code.",
            code: "INVALID_ACCESS_CODE",
          },
          400
        );
      }

      const clientId =
        getTrustedClientIdentifier(request);

      if (!clientId) {
        return rateLimitError(
          "RATE_LIMIT_UNAVAILABLE"
        );
      }

      const limits =
        await checkMultipleRateLimits([
          {
            type: "voter-client",
            identifier: clientId,
          },
          {
            type: "voter-credential",
            identifier:
              `${OFFICIAL_ELECTION_ID}:${accessCode}`,
          },
        ]);

      if (!limits.allowed) {
        return rateLimitError(
          limits.reason,
          limits.retryAfterSeconds
        );
      }

      const sessionToken =
        randomBytes(32).toString("base64url");

      const result =
        await callSignedAppsScript({
          action: "createVotingSession",
          electionId: OFFICIAL_ELECTION_ID,
          accessCode,
          sessionToken,
        });

      if (!result.success) {
        return jsonResponse(
          {
            success: false,
            message:
              result.message ||
              "Unable to create voting session.",
            code:
              result.code ||
              "SESSION_CREATION_FAILED",
          },
          400
        );
      }

      return jsonResponse({
        success: true,
        message:
          "Voting session created successfully.",
        electionId: OFFICIAL_ELECTION_ID,
        voter: result.voter,
        sessionToken,
        session: result.session,
      });
    }

    // ============================================
    // OFFICIAL BALLOT SUBMISSION
    // ============================================

    if (action === "submitBallot") {
      if (!isOfficialElection(body.electionId)) {
        return electionAccessError();
      }

      const sessionToken =
        typeof body.sessionToken === "string"
          ? body.sessionToken.trim()
          : "";

      if (!SESSION_TOKEN_PATTERN.test(sessionToken)) {
        return jsonResponse(
          {
            success: false,
            message:
              "A valid voting session is required.",
            code: "INVALID_SESSION",
          },
          400
        );
      }

      const selections =
        validateBallotSelections(
          body.selections
        );

      if (!selections) {
        return jsonResponse(
          {
            success: false,
            message:
              "Your ballot contains invalid or incomplete selections.",
            code: "INVALID_BALLOT",
          },
          400
        );
      }

      const clientId =
        getTrustedClientIdentifier(request);

      if (!clientId) {
        return rateLimitError(
          "RATE_LIMIT_UNAVAILABLE"
        );
      }

      const sessionIdentifier = createHash("sha256")
        .update(sessionToken, "utf8")
        .digest("hex");

      const limits =
        await checkMultipleRateLimits([
          {
            type: "voter-client",
            identifier: clientId,
          },
          {
            type: "voter-credential",
            identifier:
              `${OFFICIAL_ELECTION_ID}:SESSION:${sessionIdentifier}`,
          },
        ]);

      if (!limits.allowed) {
        return rateLimitError(
          limits.reason,
          limits.retryAfterSeconds
        );
      }

      const result =
        await callSignedAppsScript({
          action: "submitBallot",
          electionId: OFFICIAL_ELECTION_ID,
          sessionToken,
          selections,
        });

      if (!result.success) {
        const code =
          result.code ||
          "BALLOT_SUBMISSION_FAILED";

        return jsonResponse(
          {
            success: false,
            message:
              result.message ||
              "Unable to submit your ballot.",
            code,
          },
          code === "BALLOT_SUBMISSION_DISABLED"
            ? 403
            : code === "SUBMISSION_REQUIRES_REVIEW" ||
                code === "BALLOT_REVIEW_REQUIRED"
              ? 409
              : 400
        );
      }

      return jsonResponse({
        success: true,
        message:
          result.message ||
          "Your ballot has been submitted successfully.",
        electionId: OFFICIAL_ELECTION_ID,
        status: result.status,
        reference: result.reference,
      });
    }

    // ============================================
    // PUBLIC ELECTION ACTIONS
    // ============================================

    if (PUBLIC_ACTIONS.has(action)) {
      if (!isOfficialElection(body.electionId)) {
        return electionAccessError();
      }

      return jsonResponse(
        await callAppsScript({
          action,
          electionId: OFFICIAL_ELECTION_ID,
        })
      );
    }

    // ============================================
    // ADMIN ACTIONS
    // ============================================

    const isAdminRead =
      ADMIN_READ_ACTIONS.has(action);

    const isAdminWrite =
      ADMIN_WRITE_ACTIONS.has(action);

    const isElectionControl =
      ELECTION_CONTROL_ACTIONS.has(action);

    if (
      isAdminRead ||
      isAdminWrite ||
      isElectionControl
    ) {
      if (!hasAdminToken(body)) {
        return jsonResponse(
          {
            success: false,
            message:
              "Administrator session is required.",
            code: "MISSING_ADMIN_SESSION",
          },
          401
        );
      }

      if (!isOfficialElection(body.electionId)) {
        return electionAccessError();
      }

      const electionId =
        OFFICIAL_ELECTION_ID;

      const adminToken =
        body.adminToken as string;
      
      // ==========================================
// ADMIN OPERATION RATE LIMITING
// ==========================================

const clientId =
getTrustedClientIdentifier(request);

if (!clientId) {
return rateLimitError(
  "RATE_LIMIT_UNAVAILABLE"
);
}

const adminLimits =
await checkMultipleRateLimits([
  {
    type: "admin-operation",
    identifier: clientId,
  },
]);

if (!adminLimits.allowed) {
return rateLimitError(
  adminLimits.reason,
  adminLimits.retryAfterSeconds
);
}

      // ==========================================
      // OFFICIAL INTEGRITY VERIFICATION
      // ==========================================

      if (
        action ===
        "verifyOfficialAccessCodeIntegrity"
      ) {
        return jsonResponse(
          await callAppsScript({
            action:
              "verifyOfficialAccessCodeIntegrity",
            electionId,
            adminToken,
          })
        );
      }

      // ==========================================
      // OFFICIAL BULK ACCESS-CODE GENERATION
      // ==========================================

      if (
        action ===
        "generateBulkVoterAccessCodes"
      ) {
        return generateOfficialBulkBatch(
          electionId,
          adminToken
        );
      }

      // ==========================================
      // INDIVIDUAL ACCESS-CODE GENERATION
      // ==========================================

      if (
        action === "generateVoterAccessCode"
      ) {
        const voterId = String(
          body.voterId || ""
        ).trim();

        if (!voterId) {
          return jsonResponse(
            {
              success: false,
              message: "Voter ID is required.",
              code: "MISSING_VOTER_ID",
            },
            400
          );
        }

        const votersResponse =
          await callAppsScript({
            action: "getVoters",
            electionId,
            adminToken,
          });

        if (
          !votersResponse.success ||
          !Array.isArray(
            votersResponse.voters
          )
        ) {
          return jsonResponse(
            {
              success: false,
              message:
                "Administrator authorization failed.",
              code: "UNAUTHORIZED",
            },
            403
          );
        }

        const voters =
          votersResponse.voters as Voter[];

        const voter = voters.find(
          (item) =>
            String(item.id) === voterId
        );

        if (!voter) {
          return jsonResponse(
            {
              success: false,
              message: "Voter not found.",
              code: "VOTER_NOT_FOUND",
            },
            404
          );
        }

        let accessCode: string;

        try {
          accessCode =
            generateAccessCode(voter.name);
        } catch {
          return jsonResponse(
            {
              success: false,
              message:
                "Unable to generate an access code for this voter.",
              code: "INVALID_VOTER_NAME",
            },
            400
          );
        }

        const issuedResponse =
          await callAppsScript({
            action: "issueVoterAccessCode",
            electionId,
            voterId,
            accessCode,
            adminToken,
          });

        if (!issuedResponse.success) {
          return jsonResponse(
            {
              success: false,
              message:
                issuedResponse.message ||
                "Unable to issue access code.",
              code: "ISSUANCE_FAILED",
            },
            400
          );
        }

        return jsonResponse({
          success: true,
          message:
            "Access code generated successfully. Copy it now; it cannot be retrieved later.",
          accessCode,
          voterId,
        });
      }

      // ==========================================
      // FORWARD AUTHORIZED ADMIN ACTION
      // ==========================================

      return jsonResponse(
        await callAppsScript({
          ...body,
          action,
          electionId,
        })
      );
    }

    // ============================================
    // DEFAULT DENY
    // ============================================

    return jsonResponse(
      {
        success: false,
        message: "Invalid API action.",
        code: "INVALID_ACTION",
      },
      400
    );

  } catch (error) {
    console.error(
      "Election API request failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return jsonResponse(
      {
        success: false,
        message:
          "Unable to communicate with the election server.",
        code: "SERVER_ERROR",
      },
      500
    );
  }
}