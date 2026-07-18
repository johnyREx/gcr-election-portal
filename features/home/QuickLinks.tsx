import Link from "next/link";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { quickLinks } from "@/constants/quickLinks";

export default function QuickLinks() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Explore
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Quick Links
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Access important election information and services.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.id} href={link.href} className="group">
              <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-green-700">
                    {link.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="leading-7 text-slate-600">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}