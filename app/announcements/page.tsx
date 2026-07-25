import { Bell } from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { announcements } from "@/constants/announcements";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import EmptyState from "@/components/shared/EmptyState";

export default function AnnouncementsPage() {
  return (
    <>
      <Section className="border-b bg-slate-50">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
              Election Committee
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Official Notices
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Official announcements and election updates from the
              ACGC Election Committee.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          {announcements.length > 0 ? (
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-green-700">
                      {announcement.date}
                    </p>

                    <h2 className="mt-3 text-xl font-bold text-slate-900">
                      {announcement.title}
                    </h2>

                    <p className="mt-4 leading-7 text-slate-600">
                      {announcement.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <EmptyState
                icon={Bell}
                title="No official notices yet"
                description="Announcements from the ACGC Election Committee will appear here."
                actionLabel="Return Home"
                actionHref="/"
              />
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}