export const config = {
  electionId:
    process.env.NEXT_PUBLIC_ELECTION_ID ||
    "ACGC-GENERAL-2026",

  environment:
    process.env.NEXT_PUBLIC_ELECTION_ENV ||
    "test",
} as const;