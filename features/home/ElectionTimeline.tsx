import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { electionTimeline } from "@/constants/electionTimeline";

export default function ElectionTimeline() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Key Dates
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Election Timeline
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Follow each stage of the GCR General Elections 2026.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {electionTimeline.map((item, index) => (
            <div key={item.id} className="relative flex gap-6 pb-10 last:pb-0">
              {index !== electionTimeline.length - 1 && (
                <div className="absolute left-[11px] top-6 h-full w-px bg-slate-300" />
              )}

              <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-4 border-green-700 bg-white" />

              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}