import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface ConfirmationProps {
  reference?: string;
}

export default function Confirmation({
  reference,
}: ConfirmationProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
          ✓
        </div>

        <h2 className="mt-5 text-3xl font-bold text-slate-900">
          Vote Recorded
        </h2>

        <p className="mt-4 text-slate-600">
          Thank you. Your ballot has been submitted
          successfully.
        </p>

        {reference && (
          <div className="mx-auto mt-6 max-w-sm rounded-lg border bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ballot reference
            </p>

            <p className="mt-1 break-all font-mono text-lg font-bold text-slate-900">
              {reference}
            </p>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">
          You cannot vote again in this election.
        </p>

        <Button
          asChild
          variant="outline"
          className="mt-8"
        >
          <Link href="/">Return Home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}