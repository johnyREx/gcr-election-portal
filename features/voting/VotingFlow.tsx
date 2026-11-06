"use client";

import { useEffect, useState } from "react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import Ballot from "@/features/voting/Ballot";
import Confirmation from "@/features/voting/Confirmation";
import VerificationForm from "@/features/voting/VerificationForm";

import type {
  BallotConfirmation,
  VerifiedVotingVoter,
  VotingStep,
} from "@/features/voting/types";

/**
 * Secure voting session.
 *
 * The session token remains in React memory.
 * Never store it in localStorage or sessionStorage.
 */
interface VotingSession {
  token: string;
  expiresAt: string;
}

export default function VotingFlow() {
  const [step, setStep] = useState<VotingStep>("verify");

  const [verifiedVoter, setVerifiedVoter] =
    useState<VerifiedVotingVoter | null>(null);

  const [votingSession, setVotingSession] =
    useState<VotingSession | null>(null);

  const [confirmation, setConfirmation] =
    useState<BallotConfirmation>({});

  const [hasLoaded, setHasLoaded] = useState(false);

  const [sessionExpired, setSessionExpired] =
    useState(false);

  // =====================================================
  // CLIENT HYDRATION
  // =====================================================

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  // =====================================================
  // SESSION EXPIRATION
  // =====================================================

  useEffect(() => {
    if (!votingSession) {
      return;
    }

    const expiryTime = new Date(
      votingSession.expiresAt
    ).getTime();

    if (!Number.isFinite(expiryTime)) {
      setVotingSession(null);
      setVerifiedVoter(null);
      setSessionExpired(true);
      setStep("verify");
      return;
    }

    const checkExpiry = () => {
      if (Date.now() >= expiryTime) {
        setVotingSession(null);
        setVerifiedVoter(null);
        setSessionExpired(true);
        setStep("verify");
      }
    };

    checkExpiry();

    const interval = window.setInterval(
      checkExpiry,
      1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [votingSession]);

  // =====================================================
  // SUCCESSFUL VOTER VERIFICATION
  // =====================================================

  function handleVerified(
    voter: VerifiedVotingVoter,
    session: VotingSession
  ) {
    if (
      !session ||
      !/^[A-Za-z0-9_-]{43}$/.test(session.token)
    ) {
      return;
    }

    const expiryTime = new Date(
      session.expiresAt
    ).getTime();

    if (
      !Number.isFinite(expiryTime) ||
      expiryTime <= Date.now()
    ) {
      setSessionExpired(true);
      return;
    }

    setVerifiedVoter(voter);
    setVotingSession(session);
    setSessionExpired(false);
    setStep("ballot");
  }

  // =====================================================
  // SUCCESSFUL BALLOT SUBMISSION
  // =====================================================

  function handleSubmitted(reference: string) {
    setVotingSession(null);
    setVerifiedVoter(null);

    setConfirmation({
      reference,
    });

    setStep("confirmation");
  }

  // =====================================================
  // RENDER
  // =====================================================

  if (!hasLoaded) {
    return null;
  }

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* PAGE HEADER */}

          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              ACGC General Elections 2026
            </p>

            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Cast Your Vote
            </h1>

            <p className="mt-4 text-slate-600">
              Verify your identity before accessing
              the official ballot.
            </p>
          </div>

          {/* EXPIRED SESSION NOTICE */}

          {sessionExpired && step === "verify" && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              Your voting session has expired.
              Please verify your access code again.
            </div>
          )}

          {/* STEP 1: VOTER VERIFICATION */}

          {step === "verify" && (
            <VerificationForm
              onVerified={handleVerified}
            />
          )}

          {/* STEP 2: OFFICIAL BALLOT */}

          {step === "ballot" &&
            verifiedVoter &&
            votingSession && (
              <Ballot
                voter={verifiedVoter}
                session={votingSession}
                onSubmitted={handleSubmitted}
              />
            )}

          {/* STEP 3: CONFIRMATION */}

          {step === "confirmation" && (
            <Confirmation
              reference={confirmation.reference}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}