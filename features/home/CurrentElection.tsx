import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CurrentElection() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Current Election
          </h2>

          <p className="mt-2 text-slate-600">
            Stay informed about the ongoing election.
          </p>
        </div>

        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>GCR General Elections 2026</CardTitle>

              <Badge className="bg-green-600 hover:bg-green-600">
                OPEN
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <p>
              <strong>Voting Period:</strong> 21 Nov 2026 - 22 Nov 2026
            </p>

            <p>
              <strong>Positions:</strong> President, Vice President,
              Secretary, Treasurer, PRO
            </p>

            <p>
              <strong>Eligible Voters:</strong> 347
            </p>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}