import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { trivia } from "@/constants/trivia";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AfricanLeadersTrivia() {
  return (
    <Section>
      <Container>
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Did You Know?
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            African Leaders Trivia
          </h2>

          <p className="mt-3 text-slate-600">
            Learn something new while staying informed.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {trivia.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {item.question}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="font-medium text-green-700">
                  {item.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}