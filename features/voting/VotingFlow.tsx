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

export default function VotingFlow() {
  const [step, setStep] =
    useState<VotingStep>("verify");
  const [verifiedVoter, setVerifiedVoter] =
    useState<VerifiedVotingVoter | null>(null);
  const [confirmation, setConfirmation] =
    useState<BallotConfirmation>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  if (!hasLoaded) {
    return null;
  }

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              GCR General Elections 2026
            </p>

            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Cast Your Vote
            </h1>

            <p className="mt-4 text-slate-600">
              Verify your identity before accessing
              the official ballot.
            </p>
          </div>

          {step === "verify" && (
            <VerificationForm
              onVerified={(voter) => {
                setVerifiedVoter(voter);
                setStep("ballot");
              }}
            />
          )}

          {step === "ballot" &&
            verifiedVoter && (
              <Ballot
                voter={verifiedVoter}
                onSubmitted={(reference) => {
                  setConfirmation({ reference });
                  setStep("confirmation");
                }}
              />
            )}

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