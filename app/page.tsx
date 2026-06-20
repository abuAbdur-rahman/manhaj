import Link from "next/link";

const recentPlaceholders = [
  { id: "recent-1", time: "1 hour ago" },
  { id: "recent-2", time: "3 hours ago" },
  { id: "recent-3", time: "5 hours ago" },
];

const seriesPlaceholders = [
  { id: "series-1" },
  { id: "series-2" },
  { id: "series-3" },
  { id: "series-4" },
];

const scholarPlaceholders = [
  { id: "scholar-1" },
  { id: "scholar-2" },
  { id: "scholar-3" },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/95 backdrop-blur supports-[backdrop-filter]:bg-sand-50/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-forest-600"
          >
            Manhaj
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-forest-700">
            <Link
              href="/scholars"
              className="transition-colors hover:text-forest-500"
            >
              Scholars
            </Link>
            <Link
              href="/search"
              className="transition-colors hover:text-forest-500"
            >
              Search
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-sand-200 bg-sand-100">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
            <h1 className="text-4xl font-bold tracking-tight text-forest-700 sm:text-5xl">
              Manhaj
            </h1>
            <p className="mt-3 text-lg text-forest-500 sm:text-xl">
              Ilm, organized.
            </p>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-forest-600/80">
              Stream and download audio lectures from trusted Nigerian
              Sunni/Salafi scholars. Curated. Offline-friendly. Free.
            </p>
          </div>
        </section>

        <section className="border-b border-sand-200">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-forest-700">
                Recently Added
              </h2>
              <Link
                href="/search"
                className="text-sm font-medium text-gold-500 transition-colors hover:text-gold-400"
              >
                View all
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentPlaceholders.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-sand-200 bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-forest-700">
                      Title of the lecture episode goes here
                    </p>
                    <span className="shrink-0 rounded bg-forest-100 px-1.5 py-0.5 text-[11px] font-medium text-forest-600">
                      NEW
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-forest-500">
                    Scholar Name &middot; Series Title
                  </p>
                  <p className="mt-1 text-xs text-sand-300">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-sand-200 bg-sand-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-xl font-semibold text-forest-700">
              Featured Series
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {seriesPlaceholders.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-sand-200 bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="mb-3 h-24 rounded bg-sand-100" />
                  <p className="text-sm font-medium leading-snug text-forest-700">
                    Series Title
                  </p>
                  <p className="mt-1 text-xs text-forest-500">Scholar Name</p>
                  <p className="mt-1 text-xs text-sand-300">12 episodes</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-sand-200">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-forest-700">
                Our Scholars
              </h2>
              <Link
                href="/scholars"
                className="text-sm font-medium text-gold-500 transition-colors hover:text-gold-400"
              >
                View all
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scholarPlaceholders.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-sand-200 bg-white p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="h-12 w-12 shrink-0 rounded-full bg-sand-200" />
                  <div>
                    <p className="text-sm font-medium text-forest-700">
                      Sheikh Name
                    </p>
                    <p className="text-xs text-forest-500">
                      Yoruba &middot; English
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-forest-600">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center">
            <h2 className="text-2xl font-bold text-white">
              Listen offline. Anywhere.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-forest-100">
              Download lectures to your device and play them without an internet
              connection. Built for Nigeria&apos;s data and power constraints.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-sand-200 bg-sand-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-center text-xs text-forest-500 sm:flex-row sm:text-left">
          <p>&copy; {new Date().getFullYear()} Manhaj. Ilm, organized.</p>
          <p>Sadaqah Jariyah — free for everyone, forever.</p>
        </div>
      </footer>
    </>
  );
}
