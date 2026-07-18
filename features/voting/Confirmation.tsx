import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Confirmation() {
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
          Thank you. Your vote has been submitted successfully.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          You cannot vote again in this election.
        </p>

        <Button asChild variant="outline" className="mt-8">
          <Link href="/">Return Home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}