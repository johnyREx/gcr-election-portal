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

const TEST_ELECTION_ID = "ACGC-MOCK-2026";

const MAX_REQUEST_BYTES = 16_384;

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

type BallotSelection = {
  position: string;
  candidateId: string;
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
  "getAdminCandidates",
  "getAnalytics",
  "getPollingDashboard",
  "getAdminResults",
  "getElectionReadiness",
]);

const ADMIN_WRITE_ACTIONS = new Set([
  "addVoter",
  "updateVoter",
  "importVoters",
  "addCandidate",
  "updateCandidate",
  "deleteCandidate",
  "generateVoterAccessCode",
]);

const ELECTION_CONTROL_ACTIONS = new Set([
  "closeElection",
  "publishElectionResults",
  "hideElectionResults",
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
  "updateElectionStatus",
  "resetElection",
  "testServerConnection",
  "signedPayload",
  "serverAuth",
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
  if (isLocalDevelopment()) {
    return "local-development-client";
  }

  /*
   * Production remains fail-closed.
   *
   * Before deployment, implement trusted
   * client identification using verified
   * hosting-platform proxy behavior.
   *
   * Do not blindly trust X-Forwarded-For.
   */
  void request;

  return null;
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
// TEST ELECTION VALIDATION
// =====================================================

function isTestElection(
  electionId: unknown
): boolean {
  return (
    typeof electionId === "string" &&
    electionId.trim() === TEST_ELECTION_ID
  );
}

function testElectionError() {
  return jsonResponse(
    {
      success: false,
      message:
        "This action is restricted to the TEST election.",
      code: "TEST_ELECTION_ONLY",
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

  const payloadJson =
    JSON.stringify(payload);

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

  const data: unknown =
    await response.json();

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
      signedPayload:
        signed.payloadJson,
      serverAuth:
        signed.serverAuth,
    }),
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "SIGNED_REQUEST_FAILED"
    );
  }

  const data: unknown =
    await response.json();

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
    value.length === 0 ||
    value.length > 20
  ) {
    return null;
  }

  const selections: BallotSelection[] = [];

  const positions = new Set<string>();

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
      typeof selection.position !==
        "string" ||
      !["string", "number"].includes(
        typeof selection.candidateId
      )
    ) {
      return null;
    }

    const position =
      selection.position.trim();

    const candidateId = String(
      selection.candidateId
    ).trim();

    if (
      !position ||
      !candidateId ||
      position.length > 100 ||
      candidateId.length > 150
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
    typeof body.adminToken ===
      "string" &&
    body.adminToken.trim().length > 0
  );
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
      request.headers.get(
        "content-length"
      ) || 0
    );

    if (
      contentLength >
      MAX_REQUEST_BYTES
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Request body is too large.",
          code: "REQUEST_TOO_LARGE",
        },
        413
      );
    }

    const rawBody =
      await request.text();

    if (
      Buffer.byteLength(
        rawBody,
        "utf8"
      ) > MAX_REQUEST_BYTES
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Request body is too large.",
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
          message:
            "Invalid JSON request.",
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
          message:
            "Invalid request body.",
          code: "INVALID_REQUEST",
        },
        400
      );
    }

    const action =
      typeof body.action ===
      "string"
        ? body.action.trim()
        : "";

    if (!action) {
      return jsonResponse(
        {
          success: false,
          message:
            "An API action is required.",
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
          code:
            "SIGNED_REQUEST_FORBIDDEN",
        },
        403
      );
    }

    // ============================================
    // DISABLED ACTIONS
    // ============================================

    if (
      DISABLED_ACTIONS.has(action)
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "This API action is disabled.",
          code: "ACTION_DISABLED",
        },
        403
      );
    }

    // ============================================
    // EXPLICIT ALLOWLIST
    // ============================================

    if (
      !ALLOWED_ACTIONS.has(action)
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Invalid API action.",
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
        typeof body.username ===
        "string"
          ? body.username.trim()
          : "";

      const password =
        typeof body.password ===
        "string"
          ? body.password
          : "";

      if (!username || !password) {
        return jsonResponse(
          {
            success: false,
            message:
              "Username and password are required.",
            code:
              "MISSING_CREDENTIALS",
          },
          400
        );
      }

      const clientId =
        getTrustedClientIdentifier(
          request
        );

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
            type:
              "admin-credential",
            identifier:
              username.toLowerCase(),
          },
        ]);

      if (!limits.allowed) {
        return rateLimitError(
          limits.reason,
          limits.retryAfterSeconds
        );
      }

      const result =
        await callAppsScript({
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
      action ===
        "verifyAdminSession" ||
      action === "logoutAdmin"
    ) {
      if (!hasAdminToken(body)) {
        return jsonResponse(
          {
            success: false,
            message:
              "Administrator session is required.",
            code:
              "MISSING_ADMIN_SESSION",
          },
          401
        );
      }

      const result =
        await callAppsScript({
          action,
          adminToken:
            body.adminToken,
        });

      return jsonResponse(result);
    }

    // ============================================
    // SECURE VOTING SESSION
    // ============================================

    if (
      action ===
      "createVotingSession"
    ) {
      if (
        !isTestElection(
          body.electionId
        )
      ) {
        return testElectionError();
      }

      const accessCode =
        typeof body.accessCode ===
        "string"
          ? body.accessCode
              .trim()
              .toUpperCase()
          : "";

      if (!accessCode) {
        return jsonResponse(
          {
            success: false,
            message:
              "Access code is required.",
            code:
              "MISSING_CREDENTIALS",
          },
          400
        );
      }

      const clientId =
        getTrustedClientIdentifier(
          request
        );

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
            type:
              "voter-credential",
            identifier:
              `${TEST_ELECTION_ID}:${accessCode}`,
          },
        ]);

      if (!limits.allowed) {
        return rateLimitError(
          limits.reason,
          limits.retryAfterSeconds
        );
      }

      const sessionToken =
        randomBytes(32)
          .toString("base64url");

      const result =
        await callSignedAppsScript({
          action:
            "createVotingSession",
          electionId:
            TEST_ELECTION_ID,
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
        electionId:
          TEST_ELECTION_ID,
        voter: result.voter,
        sessionToken,
        session: result.session,
      });
    }

    // ============================================
    // SECURE BALLOT SUBMISSION
    // ============================================

    if (
      action === "submitBallot"
    ) {
      if (
        !isTestElection(
          body.electionId
        )
      ) {
        return testElectionError();
      }

      const sessionToken =
        typeof body.sessionToken ===
        "string"
          ? body.sessionToken.trim()
          : "";

      if (
        !/^[A-Za-z0-9_-]{43}$/.test(
          sessionToken
        )
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "A valid voting session is required.",
            code:
              "INVALID_SESSION",
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
            code:
              "INVALID_BALLOT",
          },
          400
        );
      }

      const result =
        await callSignedAppsScript({
          action: "submitBallot",
          electionId:
            TEST_ELECTION_ID,
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
          code ===
            "BALLOT_SUBMISSION_DISABLED"
            ? 403
            : 400
        );
      }

      return jsonResponse({
        success: true,
        message:
          result.message ||
          "Your ballot has been submitted successfully.",
        status:
          result.status,
        reference:
          result.reference,
      });
    }

    // ============================================
    // PUBLIC ELECTION ACTIONS
    // ============================================

    if (
      PUBLIC_ACTIONS.has(action)
    ) {
      if (
        !isTestElection(
          body.electionId
        )
      ) {
        return testElectionError();
      }

      return jsonResponse(
        await callAppsScript({
          action,
          electionId:
            TEST_ELECTION_ID,
        })
      );
    }

    // ============================================
    // ADMIN ACTIONS
    // ============================================

    const isAdminRead =
      ADMIN_READ_ACTIONS.has(
        action
      );

    const isAdminWrite =
      ADMIN_WRITE_ACTIONS.has(
        action
      );

    const isElectionControl =
      ELECTION_CONTROL_ACTIONS.has(
        action
      );

    if (
      isAdminRead ||
      isAdminWrite ||
      isElectionControl
    ) {
      if (
        !hasAdminToken(body)
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Administrator session is required.",
            code:
              "MISSING_ADMIN_SESSION",
          },
          401
        );
      }

      if (
        !isTestElection(
          body.electionId
        )
      ) {
        return testElectionError();
      }

      // ==========================================
      // ACCESS CODE GENERATION
      // ==========================================

      if (
        action ===
        "generateVoterAccessCode"
      ) {
        const voterId = String(
          body.voterId || ""
        ).trim();

        if (!voterId) {
          return jsonResponse(
            {
              success: false,
              message:
                "Voter ID is required.",
              code:
                "MISSING_VOTER_ID",
            },
            400
          );
        }

        const votersResponse =
          await callAppsScript({
            action: "getVoters",
            electionId:
              TEST_ELECTION_ID,
            adminToken:
              body.adminToken,
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
              code:
                "UNAUTHORIZED",
            },
            403
          );
        }

        const voters =
          votersResponse.voters as Voter[];

        const voter =
          voters.find(
            (item) =>
              String(item.id) ===
              voterId
          );

        if (!voter) {
          return jsonResponse(
            {
              success: false,
              message:
                "Voter not found.",
              code:
                "VOTER_NOT_FOUND",
            },
            404
          );
        }

        let accessCode: string;

        try {
          accessCode =
            generateAccessCode(
              voter.name
            );
        } catch {
          return jsonResponse(
            {
              success: false,
              message:
                "Unable to generate an access code for this voter.",
              code:
                "INVALID_VOTER_NAME",
            },
            400
          );
        }

        const issuedResponse =
          await callAppsScript({
            action:
              "issueVoterAccessCode",
            electionId:
              TEST_ELECTION_ID,
            voterId,
            accessCode,
            adminToken:
              body.adminToken,
          });

        if (
          !issuedResponse.success
        ) {
          return jsonResponse(
            {
              success: false,
              message:
                issuedResponse.message ||
                "Unable to issue access code.",
              code:
                "ISSUANCE_FAILED",
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
          electionId:
            TEST_ELECTION_ID,
        })
      );
    }

    // ============================================
    // DEFAULT DENY
    // ============================================

    return jsonResponse(
      {
        success: false,
        message:
          "Invalid API action.",
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