import Container from "@/components/layout/Container";
import { trivia } from "@/constants/trivia";

export default function AfricanLeadersTrivia() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-10 text-white sm:py-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-700/10 blur-3xl"
      />

      <Container>
        <div className="relative">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-green-400" />

                <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-400">
                  Civic Corner
                </p>
              </div>

              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                A little history before you go
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-400 sm:text-right">
              Three moments from Ghanaian, African and
              international political history.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] md:grid-cols-3">
            {trivia.map((item, index) => (
              <article
                key={item.id}
                className="group relative border-b border-white/10 p-5 transition duration-300 hover:bg-white/[0.05] md:border-b-0 md:border-r md:last:border-r-0 sm:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-400">
                    {item.category}
                  </span>

                  <span className="text-xs font-extrabold text-white/20">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold leading-6 text-white">
                  {item.question}
                </h3>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Answer
                  </p>

                  <p className="mt-1 text-sm font-bold text-green-400">
                    {item.answer}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-center">
            <span className="hidden h-px w-12 bg-white/10 sm:block" />

            <p className="max-w-2xl text-xs leading-5 text-slate-500">
              An informed community strengthens
              democratic participation and responsible
              leadership.
            </p>

            <span className="hidden h-px w-12 bg-white/10 sm:block" />
          </div>
        </div>
      </Container>
    </section>
  );
}