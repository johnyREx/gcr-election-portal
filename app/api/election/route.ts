import {
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const apiUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

type ApiResult = {
  success: boolean;
  message?: string;
  code?: string;
  [key: string]: unknown;
};

type Voter = {
  id: string | number;
  name: string;
};

type ElectionApiRequest = Record<string, unknown> & {
  action?: string;
};

type BallotSelection = {
  position: string;
  candidateId: string;
};

function jsonResponse(data: ApiResult, status = 200) {
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
// SECURE RANDOM CHARACTER GENERATION
// =====================================================

function secureRandomCharacters(length: number): string {
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
// VOTER NAME PREFIX
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
      "First and last names are required to generate an access-code prefix."
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
// GENERATE VOTER ACCESS CODE
// =====================================================

function generateAccessCode(voterName: string): string {
  const prefix = buildPrefix(voterName);

  return [
    prefix,
    secureRandomCharacters(4),
    secureRandomCharacters(4),
    secureRandomCharacters(4),
  ].join("-");
}

// =====================================================
// SIGNED SERVER AUTHENTICATION
// =====================================================

function createSignedServerRequest(
  payload: Record<string, unknown>
) {
  const secret = process.env.ELECTION_SERVER_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ELECTION_SERVER_SECRET is not configured."
    );
  }

  const action = String(payload.action || "").trim();

  if (!action) {
    throw new Error(
      "Cannot sign a request without an action."
    );
  }

  const timestamp = Date.now();

  const nonce = randomBytes(24).toString("base64url");

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
// GOOGLE APPS SCRIPT CLIENT
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
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body),
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("APPS_SCRIPT_REQUEST_FAILED");
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !("success" in data)
  ) {
    throw new Error("INVALID_API_RESPONSE");
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

  const signed = createSignedServerRequest(payload);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      signedPayload: signed.payloadJson,
      serverAuth: signed.serverAuth,
    }),
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("SIGNED_REQUEST_FAILED");
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !("success" in data)
  ) {
    throw new Error("INVALID_API_RESPONSE");
  }

  return data as ApiResult;
}

// =====================================================
// VALIDATE BALLOT SELECTIONS
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

    const selection = item as Record<string, unknown>;

    if (
      typeof selection.position !== "string" ||
      !["string", "number"].includes(
        typeof selection.candidateId
      )
    ) {
      return null;
    }

    const position = selection.position.trim();

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
// MAIN API ROUTE
// =====================================================

export async function POST(request: NextRequest) {
  if (!apiUrl) {
    return jsonResponse(
      {
        success: false,
        message: "Election API URL is not configured.",
        code: "API_NOT_CONFIGURED",
      },
      500
    );
  }

  try {
    const body: ElectionApiRequest = await request.json();

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

    const action = String(body.action || "").trim();

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

    // ==============================================
    // SIGNED SERVER CONNECTION TEST
    // ==============================================

    if (action === "testServerConnection") {
      const result = await callSignedAppsScript({
        action: "testServerConnection",
      });

      return jsonResponse(result);
    }

    // ==============================================
    // CREATE VOTING SESSION
    // ==============================================

    if (action === "createVotingSession") {
      const electionId = String(
        body.electionId || ""
      ).trim();

      const accessCode = String(
        body.accessCode || ""
      )
        .trim()
        .toUpperCase();

      if (!electionId || !accessCode) {
        return jsonResponse(
          {
            success: false,
            message:
              "Election ID and access code are required.",
            code: "MISSING_CREDENTIALS",
          },
          400
        );
      }

      const sessionToken = randomBytes(32)
        .toString("base64url");

      const result = await callSignedAppsScript({
        action: "createVotingSession",
        electionId,
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
        electionId,
        voter: result.voter,
        sessionToken,
        session: result.session,
      });
    }

    // ==============================================
    // SECURE BALLOT SUBMISSION
    // ==============================================

    if (action === "submitBallot") {
      const electionId =
        typeof body.electionId === "string"
          ? body.electionId.trim()
          : "";

      const sessionToken =
        typeof body.sessionToken === "string"
          ? body.sessionToken.trim()
          : "";

      if (
        !electionId ||
        !/^[A-Za-z0-9_-]{43}$/.test(sessionToken)
      ) {
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

      const selections = validateBallotSelections(
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

      /**
       * Security boundary:
       *
       * We deliberately construct a new payload.
       *
       * We do not forward:
       * - voterId
       * - accessCode
       * - adminToken
       * - arbitrary client-provided fields
       *
       * Apps Script resolves the voter from
       * the authenticated voting session.
       */
      const result = await callSignedAppsScript({
        action: "submitBallot",
        electionId,
        sessionToken,
        selections,
      });

      if (!result.success) {
        const code =
          result.code || "BALLOT_SUBMISSION_FAILED";

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
            : 400
        );
      }

      return jsonResponse({
        success: true,
        message:
          result.message ||
          "Your ballot has been submitted successfully.",
        status: result.status,
        reference: result.reference,
      });
    }

    // ==============================================
    // BLOCK DIRECT ACCESS-CODE ISSUANCE
    // ==============================================

    if (action === "issueVoterAccessCode") {
      return jsonResponse(
        {
          success: false,
          message:
            "Direct access-code issuance is disabled. Use secure generation.",
          code: "DIRECT_ISSUANCE_DISABLED",
        },
        403
      );
    }

    // ==============================================
    // BLOCK SIGNED-ONLY ACTIONS
    // ==============================================

    if (
      action === "signedPayload" ||
      action === "serverAuth"
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid API action.",
          code: "INVALID_ACTION",
        },
        400
      );
    }

    // ==============================================
    // EXISTING API ACTIONS
    // ==============================================

    if (action !== "generateVoterAccessCode") {
      const data = await callAppsScript(body);

      return jsonResponse(data);
    }

    // ==============================================
    // GENERATE VOTER ACCESS CODE
    // ==============================================

    const electionId = String(
      body.electionId || ""
    ).trim();

    const voterId = String(
      body.voterId || ""
    ).trim();

    const adminToken = String(
      body.adminToken || ""
    ).trim();

    if (!electionId || !voterId || !adminToken) {
      return jsonResponse(
        {
          success: false,
          message:
            "Election ID, voter ID and administrator session are required.",
          code: "MISSING_REQUIRED_FIELDS",
        },
        400
      );
    }

    // ==============================================
    // VERIFY ADMINISTRATOR
    // ==============================================

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
            "Administrator authorization failed.",
          code: "UNAUTHORIZED",
        },
        403
      );
    }

    const voters = votersResponse.voters as Voter[];

    // ==============================================
    // FIND REGISTERED VOTER
    // ==============================================

    const voter = voters.find(
      (item) => String(item.id) === voterId
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

    // ==============================================
    // GENERATE SECURE ACCESS CODE
    // ==============================================

    let accessCode: string;

    try {
      accessCode = generateAccessCode(voter.name);
    } catch {
      return jsonResponse(
        {
          success: false,
          message:
            "Unable to generate an access code for this voter. Check that the voter has a valid first and last name.",
          code: "INVALID_VOTER_NAME",
        },
        400
      );
    }

    // ==============================================
    // REGISTER ACCESS CODE
    // ==============================================

    const issuedResponse = await callAppsScript({
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

    // ==============================================
    // DISPLAY ACCESS CODE ONCE
    // ==============================================

    return jsonResponse({
      success: true,
      message:
        "Access code generated successfully. Copy it now; it cannot be retrieved later.",
      accessCode,
      voterId,
    });

  } catch (error) {
    /**
     * Never log request bodies, access codes,
     * administrator tokens, or session tokens.
     */
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