import Image from "next/image";
import Link from "next/link";

import Container from "@/components/layout/Container";
import { candidates } from "@/constants/candidates";

export default function CandidatePreview() {
  const featuredCandidates = candidates
    .filter(
      (candidate) =>
        candidate.slug !== "nkum-jibril-koho"
    )
    .slice(0, 4);

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white py-12 sm:py-14">
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-64 w-64 rounded-full bg-green-50 blur-3xl"
      />

      <Container>
        <div className="relative">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-green-700" />

                <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-700">
                  Approved Candidates
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Meet the candidates
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Review candidates approved by the
                Electoral Commission and the positions
                they are contesting.
              </p>
            </div>

            <Link
              href="/candidates"
              className="inline-flex h-10 w-fit shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
            >
              All Candidates →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCandidates.map(
              (candidate, index) => {
                const isPresidentialTicket =
                  candidate.jointTicket &&
                  candidate.position === "President";

                return (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.slug}`}
                    className="group"
                  >
                    <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-xl">
                      <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
                        <Image
                          src={candidate.image}
                          alt={
                            isPresidentialTicket
                              ? `${candidate.name} and ${candidate.runningMate}`
                              : candidate.name
                          }
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />

                        <div className="absolute left-4 top-4 flex items-center gap-2">
                          <span className="rounded-full border border-white/30 bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-green-800 shadow-sm backdrop-blur">
                            EC Approved
                          </span>
                        </div>

                        <span className="absolute right-4 top-4 text-xs font-extrabold text-white/70">
                          0{index + 1}
                        </span>

                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-300">
                            {isPresidentialTicket
                              ? "Presidential Ticket"
                              : candidate.position}
                          </p>

                          <h3 className="mt-1 text-lg font-extrabold leading-tight text-white">
                            {candidate.name}
                          </h3>

                          {isPresidentialTicket &&
                            candidate.runningMate && (
                              <p className="mt-1 text-xs font-medium text-slate-200">
                                with{" "}
                                {candidate.runningMate}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                          {candidate.bio}
                        </p>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {candidate.location ||
                              "Russia"}
                          </span>

                          <span className="text-xs font-bold text-green-700 transition-transform group-hover:translate-x-1">
                            Profile →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              }
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-green-100 bg-green-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-700">
              <span className="font-bold text-slate-950">
                7 approved candidates
              </span>{" "}
              are contesting across 6 electoral
              positions.
            </p>

            <Link
              href="/candidates"
              className="shrink-0 text-sm font-bold text-green-800 transition hover:text-green-950"
            >
              View complete candidate register →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}