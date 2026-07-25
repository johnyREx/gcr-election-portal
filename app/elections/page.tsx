import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Vote,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function ElectionsPage() {
  return (
    <>
      <Section className="border-b bg-slate-50">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              2026 General Elections
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Election Information
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Official information about the ACGC election process,
              important dates, voter eligibility and election procedures.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <CalendarDays className="h-8 w-8 text-green-700" />

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Election Period
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Voting is currently scheduled for 21–22 November
                  2026, subject to confirmation by the Election
                  Committee.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <CheckCircle2 className="h-8 w-8 text-green-700" />

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Voter Eligibility
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Participation is limited to eligible and verified
                  members of the Association of Compatriots
                  “Ghanaian Community” in Russia.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Vote className="h-8 w-8 text-green-700" />

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Secure Voting
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Each verified voter may submit one ballot through
                  the secure digital voting platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <FileText className="h-8 w-8 text-green-700" />

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Election Rules
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Full election procedures and official guidelines
                  will be published by the Election Committee.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="bg-green-700 hover:bg-green-800">
              <Link href="/vote">Cast Your Ballot</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/candidates">Meet the Candidates</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}