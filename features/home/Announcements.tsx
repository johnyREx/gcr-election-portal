import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { announcements } from "@/constants/announcements";

export default function Announcements() {
  return (
    <Section>
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Official Notices
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Latest Announcements
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Stay informed with official communications from the
            ACGC Election Committee.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="border-slate-200 transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                  {announcement.date}
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {announcement.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
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