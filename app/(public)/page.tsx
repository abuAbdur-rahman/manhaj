import { Search } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ScholarRow } from "@/components/scholars/scholar-row";
import { FeaturedSeriesCard } from "@/components/series/featured-series-card";
import { getFeaturedSeries, getRecentEpisodes, getScholars } from "@/lib/data";
import { RecentEpisodes } from "./recent-episodes";

export default async function HomePage() {
  const [recentEpisodes, featuredSeries, scholars] = await Promise.all([
    getRecentEpisodes(10),
    getFeaturedSeries(),
    getScholars(3),
  ]);

  return (
    <>
      <Header
        home
        title="Ilm, organized."
        actions={
          <Link
            href="/search"
            className="flex h-11 w-11 items-center justify-center rounded-full text-sand-300 transition-colors hover:bg-forest-50 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 dark:text-ink-500 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
        }
      />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-8">
          <section className="py-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-forest-700 dark:text-ink-100">
                Recently Added
              </h2>
              <Link
                href="/search"
                className="text-sm font-medium text-forest-500 transition-colors hover:text-forest-600 dark:text-ink-500 dark:hover:text-ink-100"
              >
                View all
              </Link>
            </div>

            {recentEpisodes.length > 0 ? (
              <RecentEpisodes episodes={recentEpisodes} />
            ) : (
              <p className="mt-4 text-sm text-sand-300 dark:text-ink-500">
                No lectures yet. Check back soon.
              </p>
            )}
          </section>

          {featuredSeries.length > 0 && (
            <section className="py-8 border-t border-sand-200 dark:border-ink-700">
              <h2 className="text-xl font-semibold text-forest-700 dark:text-ink-100">
                Featured Series
              </h2>

              <div className="mt-4">
                {featuredSeries.map((series) => (
                  <Link
                    key={series.id}
                    href={`/scholars/${series.scholar?.slug}/${series.slug}`}
                  >
                    <FeaturedSeriesCard series={series} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="py-8 border-t border-sand-200 dark:border-ink-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-forest-700 dark:text-ink-100">
                Scholars
              </h2>
              <Link
                href="/scholars"
                className="text-sm font-medium text-forest-500 transition-colors hover:text-forest-600 dark:text-ink-500 dark:hover:text-ink-100"
              >
                See all scholars
              </Link>
            </div>

            {scholars.length > 0 ? (
              <div className="mt-4 divide-y divide-sand-200 dark:divide-ink-700">
                {scholars.map((scholar) => (
                  <Link key={scholar.id} href={`/scholars/${scholar.slug}`}>
                    <ScholarRow scholar={scholar} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-sand-300 dark:text-ink-500">
                No scholars yet. Check back soon.
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
