import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { electionTimeline } from "@/constants/electionTimeline";

export default function ElectionTimeline() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">
            Key Dates
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            2026 Election Timeline
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Follow every important stage of the ACGC General Elections,
            from nominations and vetting to voting and the publication of
            official results.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {electionTimeline.map((item, index) => {
            const isLast =
              index === electionTimeline.length - 1;

            return (
              <div
                key={item.id}
                className="relative flex gap-5 pb-8 last:pb-0 sm:gap-7"
              >
                {!isLast && (
                  <div className="absolute left-[15px] top-8 h-full w-px bg-slate-300 sm:left-[19px]" />
                )}

                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-green-700 bg-white shadow-sm sm:h-10 sm:w-10">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-700 sm:h-3 sm:w-3" />
                </div>

                <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                      Stage {index + 1}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    {item.date}
                  </p>

                  {"description" in item && item.description ? (
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center">
          <p className="text-sm leading-6 text-amber-900">
            Dates may be adjusted by the Election Committee where necessary.
            Any official changes will be communicated through the
            announcements section.
          </p>
        </div>
      </Container>
    </Section>
  );
}