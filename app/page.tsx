export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
            Ghanaian Community in Russia
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            GCR Election Portal
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            A transparent, accessible, and secure platform for community
            elections, candidate information, announcements, and results.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800">
              View Election
            </button>

            <button className="rounded-full border border-gray-300 px-6 py-3 font-semibold transition hover:bg-gray-100">
              Meet the Candidates
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}