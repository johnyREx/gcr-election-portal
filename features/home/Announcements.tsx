import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { announcements } from "@/constants/announcements";

export default function Announcements() {
  return (
    <Section>
      <Container>
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Latest Updates
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Announcements
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Important notices and updates from the GCR Election Committee.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <p className="text-sm text-slate-500">
                  {announcement.date}
                </p>

                <CardTitle className="text-xl">
                  {announcement.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="leading-7 text-slate-600">
                  {announcement.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}